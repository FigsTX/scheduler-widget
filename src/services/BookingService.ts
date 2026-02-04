import { getWidgetGraphClient } from "@/lib/graph";
import type { ProviderProfile } from "./ProviderService";
import { getProviderRules } from "./AvailabilityService";

interface BookingRequest {
  provider: ProviderProfile;
  date: string; // ISO date string (YYYY-MM-DD)
  time: string; // e.g. "9:00 AM"
  patientName: string;
  visitReason: string;
  phone: string;
  email: string;
}

/**
 * Parse a slot label like "9:00 AM" + date string into an ISO datetime.
 */
function buildDateTime(dateStr: string, slotLabel: string): Date {
  const [time, period] = slotLabel.split(" ");
  const [hourStr, minStr] = time.split(":");
  let hour = parseInt(hourStr, 10);
  const min = parseInt(minStr, 10);

  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  const d = new Date(dateStr + "T00:00:00");
  d.setHours(hour, min, 0, 0);
  return d;
}

export async function bookAppointment(request: BookingRequest) {
  const { provider, date, time, patientName, visitReason, phone, email } =
    request;

  if (provider.schedulingSource !== "Outlook" || !provider.email) {
    throw new Error(
      "Booking is only supported for Outlook-based providers currently."
    );
  }

  const rules = await getProviderRules(provider);
  const startDate = buildDateTime(date, time);
  const endDate = new Date(
    startDate.getTime() + rules.appointmentDuration * 60000
  );

  const client = await getWidgetGraphClient();

  const event = {
    subject: `New Patient: ${patientName}`,
    body: {
      contentType: "text",
      content: `Visit Reason: ${visitReason}\nPhone: ${phone}\nEmail: ${email}`,
    },
    start: {
      dateTime: startDate.toISOString(),
      timeZone: "UTC",
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: "UTC",
    },
    showAs: "busy",
  };

  const result = await client
    .api(`/users/${provider.email}/events`)
    .post(event);

  return {
    eventId: result.id,
    start: result.start.dateTime,
    end: result.end.dateTime,
  };
}
