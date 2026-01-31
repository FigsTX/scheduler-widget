"use client";

import { useState } from "react";
import ProviderHeader from "@/components/ProviderHeader";
import AppointmentPicker from "@/components/AppointmentPicker";
import SoftHoldBanner from "@/components/SoftHoldBanner";
import IntakeForm from "@/components/IntakeForm";
import Confirmation from "@/components/Confirmation";
import { useSoftHold } from "@/hooks/useSoftHold";
import { MockAppointmentService } from "@/services/MockAppointmentService";
import type { IntakeFormData } from "@/components/IntakeForm";
import type { Appointment } from "@/services/MockAppointmentService";

export default function Home() {
  const { hold, secondsLeft, placeHold, releaseHold } = useSoftHold();
  const [showIntake, setShowIntake] = useState(false);
  const [confirmed, setConfirmed] = useState<Appointment | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSlotSelect(date: Date, time: string) {
    placeHold(date, time);
    setShowIntake(false);
    setError(null);
  }

  function handleContinue() {
    setShowIntake(true);
  }

  function handleRelease() {
    releaseHold();
    setShowIntake(false);
    setError(null);
  }

  function handleIntakeSubmit(data: IntakeFormData) {
    if (!hold) return;

    try {
      const appointment = MockAppointmentService.create(
        hold.date,
        hold.time,
        data
      );
      releaseHold();
      setShowIntake(false);
      setError(null);
      setConfirmed(appointment);
    } catch {
      setError("Something went wrong. Please try again.");
    }
  }

  function handleBookAnother() {
    setConfirmed(null);
    setShowIntake(false);
    setError(null);
  }

  if (confirmed) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto w-full max-w-2xl space-y-6">
          <ProviderHeader />
          <Confirmation
            appointment={confirmed}
            onBookAnother={handleBookAnother}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <ProviderHeader />
        <AppointmentPicker onSlotSelect={handleSlotSelect} />
        {hold && (
          <SoftHoldBanner
            date={hold.date}
            time={hold.time}
            secondsLeft={secondsLeft}
            onRelease={handleRelease}
            onContinue={handleContinue}
          />
        )}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
            {error}
          </div>
        )}
        {showIntake && hold && (
          <IntakeForm onSubmit={handleIntakeSubmit} />
        )}
      </div>
    </main>
  );
}
