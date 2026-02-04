"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DatePicker from "./DatePicker";
import TimeSlots from "./TimeSlots";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isTomorrow(date: Date) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isSameDay(date, tomorrow);
}

/** Parse "9:00 AM" into 24h hour number */
function parseSlotHour(slot: string): number {
  const [time, period] = slot.split(" ");
  let hour = parseInt(time.split(":")[0], 10);
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return hour;
}

/** Generate mock time slots for a given date, applying lead time rules */
function generateSlots(date: Date): string[] {
  const now = new Date();
  const day = date.getDay();

  // No slots on Sunday
  if (day === 0) return [];

  // No same-day appointments
  if (isSameDay(date, now)) return [];

  const base = ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM"];

  // Vary availability by day — remove some slots to feel realistic
  const seed = date.getDate() + day;
  let slots = base.filter((_, i) => (i + seed) % 3 !== 0);

  // After 1 PM today, remove tomorrow's morning slots (before 1 PM)
  if (isTomorrow(date) && now.getHours() >= 13) {
    slots = slots.filter((slot) => parseSlotHour(slot) >= 13);
  }

  return slots;
}

export default function AppointmentPicker({
  onSlotSelect,
}: {
  onSlotSelect?: (date: Date, time: string) => void;
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  });
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() + weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekOffset]);

  const slots = useMemo(() => generateSlots(selectedDate), [selectedDate]);

  function handleDateSelect(date: Date) {
    setSelectedDate(date);
    setSelectedTime(null);
  }

  function handleTimeSelect(time: string) {
    setSelectedTime(time);
    onSlotSelect?.(selectedDate, time);
  }

  const dateRangeLabel = useMemo(() => {
    const first = days[0];
    const last = days[days.length - 1];
    const fmtOpts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    const firstStr = first.toLocaleDateString("en-US", fmtOpts);
    // Only show month on the end date if it differs from the start
    if (first.getMonth() === last.getMonth()) {
      return `${firstStr} – ${last.getDate()}`;
    }
    return `${firstStr} – ${last.toLocaleDateString("en-US", fmtOpts)}`;
  }, [days]);

  return (
    <Card className="p-4 sm:p-6 rounded-xl space-y-4 sm:space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">
          Select Date &amp; Time
        </h3>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setWeekOffset((w) => Math.max(w - 1, 0))}
            disabled={weekOffset === 0}
            className="p-1.5 rounded-xl hover:bg-muted disabled:opacity-30 transition-colors"
            aria-label="Previous week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-muted-foreground min-w-[7.5rem] text-center">
            {dateRangeLabel}
          </span>
          <button
            onClick={() => setWeekOffset((w) => w + 1)}
            className="p-1.5 rounded-xl hover:bg-muted transition-colors"
            aria-label="Next week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Date strip */}
      <DatePicker
        days={days}
        selectedDate={selectedDate}
        onSelect={handleDateSelect}
      />

      {/* Time slots */}
      <TimeSlots
        slots={slots}
        selectedTime={selectedTime}
        onSelect={handleTimeSelect}
      />
    </Card>
  );
}
