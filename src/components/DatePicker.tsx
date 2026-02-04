"use client";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface DatePickerProps {
  days: Date[];
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isToday(d: Date) {
  return isSameDay(d, new Date());
}

export default function DatePicker({ days, selectedDate, onSelect }: DatePickerProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
      {days.map((day) => {
        const selected = isSameDay(day, selectedDate);
        const today = isToday(day);
        const sunday = day.getDay() === 0;
        const disabled = sunday || today;

        return (
          <button
            key={day.toISOString()}
            onClick={() => !disabled && onSelect(day)}
            disabled={disabled}
            className={`
              flex flex-col items-center justify-center flex-1 min-w-[3.5rem] py-3 px-1.5 rounded-xl
              transition-colors text-sm font-medium
              ${
                selected && !disabled
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : disabled
                    ? "bg-muted/50 text-muted-foreground/40 cursor-not-allowed"
                    : "bg-muted/50 text-foreground hover:bg-muted"
              }
            `}
          >
            <span className="text-xs uppercase tracking-wide opacity-80">
              {DAY_NAMES[day.getDay()]}
            </span>
            <span className="text-lg font-semibold mt-0.5">
              {day.getDate()}
            </span>
            {today && (
              <span className="text-[10px] mt-0.5 text-muted-foreground/60">
                Today
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
