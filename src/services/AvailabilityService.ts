import { getWidgetGraphClient } from "@/lib/graph";
import type { Client } from "@microsoft/microsoft-graph-client";
import type { ProviderProfile } from "./ProviderService";

// ──── Types ────

interface SchedulingRules {
  startHour: number;
  endHour: number;
  workDays: number[];
  appointmentDuration: number; // in minutes
}

interface CalendarEvent {
  start: string; // ISO datetime
  end: string;
}

// ──── GlobalConfig Cache ────

let cachedRules: SchedulingRules | null = null;
let cachedSiteId: string | null = null;
const listIdCache = new Map<string, string>();

async function getSiteId(client: Client): Promise<string> {
  if (cachedSiteId) return cachedSiteId;
  const hostname = process.env.SHAREPOINT_SITE_HOSTNAME!;
  const site = await client.api(`/sites/${hostname}:`).select("id").get();
  cachedSiteId = site.id;
  return site.id;
}

async function getListId(
  client: Client,
  siteId: string,
  listName: string
): Promise<string> {
  const cacheKey = `${siteId}:${listName}`;
  if (listIdCache.has(cacheKey)) return listIdCache.get(cacheKey)!;

  const lists = await client
    .api(`/sites/${siteId}/lists`)
    .select("id,displayName")
    .get();

  const match = lists.value.find(
    (l: { displayName: string }) =>
      l.displayName.toLowerCase() === listName.toLowerCase()
  );

  if (!match) throw new Error(`List "${listName}" not found.`);
  listIdCache.set(cacheKey, match.id);
  return match.id;
}

async function getGlobalConfig(client: Client): Promise<SchedulingRules> {
  if (cachedRules) return cachedRules;

  const siteId = await getSiteId(client);
  const listId = await getListId(client, siteId, "GlobalConfig");

  const result = await client
    .api(`/sites/${siteId}/lists/${listId}/items`)
    .expand("fields")
    .get();

  const items = result.value as Record<string, unknown>[];
  const configItem = items.find(
    (item) =>
      ((item.fields as Record<string, unknown>).Title as string) ===
      "DefaultOfficeHours"
  );

  if (!configItem) {
    // Fallback defaults
    cachedRules = {
      startHour: 9,
      endHour: 17,
      workDays: [1, 2, 3, 4, 5],
      appointmentDuration: 30,
    };
    return cachedRules;
  }

  const fields = configItem.fields as Record<string, unknown>;
  const workDaysRaw = (fields.WorkDays as string) ?? "1,2,3,4,5";

  cachedRules = {
    startHour: Number(fields.StartHour) || 9,
    endHour: Number(fields.EndHour) || 17,
    workDays: workDaysRaw.split(",").map((s: string) => parseInt(s.trim(), 10)),
    appointmentDuration: Number(fields.AppointmentDuration) || 30,
  };

  return cachedRules;
}

// ──── Slot Generation ────

function generatePotentialSlots(
  startHour: number,
  endHour: number,
  duration: number
): string[] {
  const slots: string[] = [];
  const totalMinutesStart = startHour * 60;
  const totalMinutesEnd = endHour * 60;

  for (let m = totalMinutesStart; m + duration <= totalMinutesEnd; m += duration) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    const period = h >= 12 ? "PM" : "AM";
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    slots.push(`${displayHour}:${min.toString().padStart(2, "0")} ${period}`);
  }

  return slots;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isSameDay(date, tomorrow);
}

function slotsOverlap(
  slotStart: Date,
  slotEnd: Date,
  eventStart: Date,
  eventEnd: Date
): boolean {
  return slotStart < eventEnd && slotEnd > eventStart;
}

// ──── Public API ────

export async function getProviderRules(
  provider: ProviderProfile
): Promise<SchedulingRules> {
  const client = await getWidgetGraphClient();
  const global = await getGlobalConfig(client);

  return {
    startHour: provider.overrideStartHour ?? global.startHour,
    endHour: provider.overrideEndHour ?? global.endHour,
    workDays: provider.overrideWorkDays ?? global.workDays,
    appointmentDuration: global.appointmentDuration,
  };
}

export async function getSlots(
  provider: ProviderProfile,
  date: Date
): Promise<string[]> {
  const rules = await getProviderRules(provider);
  const now = new Date();
  const dayOfWeek = date.getDay();

  // No same-day appointments
  if (isSameDay(date, now)) {
    return [];
  }

  // Step A: Check if this day is a work day
  if (!rules.workDays.includes(dayOfWeek)) {
    return [];
  }

  // Step B: Generate potential slots
  let potentialSlots = generatePotentialSlots(
    rules.startHour,
    rules.endHour,
    rules.appointmentDuration
  );

  // After 1 PM today, remove tomorrow's morning slots (before 1 PM)
  if (isTomorrow(date) && now.getHours() >= 13) {
    potentialSlots = potentialSlots.filter((slot) => {
      const slotDate = parseSlotToDate(date, slot);
      return slotDate.getHours() >= 13;
    });
  }

  // Step C: If Outlook-based, subtract busy times
  if (provider.schedulingSource === "Outlook" && provider.email) {
    const client = await getWidgetGraphClient();

    // Build date range for the full day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const calendarView = await client
      .api(`/users/${provider.email}/calendarView`)
      .query({
        startDateTime: startOfDay.toISOString(),
        endDateTime: endOfDay.toISOString(),
      })
      .select("start,end,showAs")
      .get();

    const busyEvents: CalendarEvent[] = (
      calendarView.value as {
        start: { dateTime: string; timeZone: string };
        end: { dateTime: string; timeZone: string };
        showAs: string;
      }[]
    )
      .filter((ev) => ev.showAs !== "free")
      .map((ev) => ({
        start: ev.start.dateTime,
        end: ev.end.dateTime,
      }));

    // Step D: Filter out slots that overlap with busy events
    return potentialSlots.filter((slotLabel) => {
      const slotDate = parseSlotToDate(date, slotLabel);
      const slotEnd = new Date(
        slotDate.getTime() + rules.appointmentDuration * 60000
      );

      return !busyEvents.some((ev) =>
        slotsOverlap(
          slotDate,
          slotEnd,
          new Date(ev.start),
          new Date(ev.end)
        )
      );
    });
  }

  // For External sources, return all potential slots (no calendar to check)
  return potentialSlots;
}

/**
 * Parse a slot label like "9:00 AM" into a Date on the given day.
 */
function parseSlotToDate(date: Date, slotLabel: string): Date {
  const [time, period] = slotLabel.split(" ");
  const [hourStr, minStr] = time.split(":");
  let hour = parseInt(hourStr, 10);
  const min = parseInt(minStr, 10);

  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  const d = new Date(date);
  d.setHours(hour, min, 0, 0);
  return d;
}
