"use client";

import { Clock, X } from "lucide-react";

interface SoftHoldBannerProps {
  date: Date;
  time: string;
  secondsLeft: number;
  onRelease: () => void;
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SoftHoldBanner({
  date,
  time,
  secondsLeft,
  onRelease,
}: SoftHoldBannerProps) {
  const urgent = secondsLeft <= 60;

  return (
    <div
      className={`rounded-xl px-4 py-3 transition-colors ${
        urgent
          ? "bg-red-50 border border-red-200"
          : "bg-accent border border-blue-200"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`shrink-0 p-1.5 rounded-xl ${
              urgent ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
            }`}
          >
            <Clock className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2 flex-wrap text-sm">
            <span className="font-semibold text-foreground">
              {formatDate(date)} at {time}
            </span>
            <span
              className={`text-xs font-medium ${
                urgent ? "text-red-600" : "text-blue-600"
              }`}
            >
              · Hold expires in {formatTimer(secondsLeft)}
            </span>
          </div>
        </div>

        <button
          onClick={onRelease}
          className="shrink-0 p-1.5 rounded-xl hover:bg-black/5 transition-colors"
          aria-label="Release hold"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
