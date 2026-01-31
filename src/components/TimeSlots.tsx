"use client";

import { Clock } from "lucide-react";

interface TimeSlotsProps {
  slots: string[];
  selectedTime: string | null;
  onSelect: (time: string) => void;
}

export default function TimeSlots({ slots, selectedTime, onSelect }: TimeSlotsProps) {
  if (slots.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
        No available slots for this date.
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-3">
        {slots.length} slot{slots.length !== 1 && "s"} available
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {slots.map((time) => {
          const selected = time === selectedTime;
          return (
            <button
              key={time}
              onClick={() => onSelect(time)}
              className={`
                py-2.5 px-3 rounded-xl text-sm font-medium transition-colors
                ${
                  selected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/50 text-foreground hover:bg-primary/10 hover:text-primary"
                }
              `}
            >
              {time}
            </button>
          );
        })}
      </div>
    </div>
  );
}
