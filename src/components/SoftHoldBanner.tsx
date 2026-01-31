"use client";

import { Clock, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SoftHoldBannerProps {
  date: Date;
  time: string;
  secondsLeft: number;
  onRelease: () => void;
  onContinue: () => void;
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
  onContinue,
}: SoftHoldBannerProps) {
  const urgent = secondsLeft <= 60;

  return (
    <div
      className={`rounded-xl p-4 transition-colors ${
        urgent
          ? "bg-red-50 border border-red-200"
          : "bg-accent border border-blue-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`shrink-0 mt-0.5 p-2 rounded-xl ${
              urgent ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
            }`}
          >
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Slot on hold
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {formatDate(date)} at {time}
            </p>
            <p
              className={`text-xs font-medium mt-1 ${
                urgent ? "text-red-600" : "text-blue-600"
              }`}
            >
              Expires in {formatTimer(secondsLeft)}
            </p>
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

      <Button
        onClick={onContinue}
        className="w-full mt-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        Continue to Intake
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}
