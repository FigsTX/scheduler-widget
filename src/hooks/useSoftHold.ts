"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const HOLD_DURATION = 5 * 60; // 5 minutes in seconds

export interface SoftHold {
  date: Date;
  time: string;
}

export function useSoftHold() {
  const [hold, setHold] = useState<SoftHold | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const placeHold = useCallback(
    (date: Date, time: string) => {
      clearTimer();
      setHold({ date, time });
      setSecondsLeft(HOLD_DURATION);

      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearTimer();
            setHold(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [clearTimer]
  );

  const releaseHold = useCallback(() => {
    clearTimer();
    setHold(null);
    setSecondsLeft(0);
  }, [clearTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return { hold, secondsLeft, placeHold, releaseHold };
}
