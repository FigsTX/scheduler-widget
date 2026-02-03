"use client";

import { useState, useEffect, use } from "react";
import { MockProviderService } from "@/services/MockProviderService";
import type { Provider } from "@/services/MockProviderService";
import AppointmentPicker from "@/components/AppointmentPicker";
import SoftHoldBanner from "@/components/SoftHoldBanner";
import IntakeForm from "@/components/IntakeForm";
import Confirmation from "@/components/Confirmation";
import { useSoftHold } from "@/hooks/useSoftHold";
import { MockAppointmentService } from "@/services/MockAppointmentService";
import type { IntakeFormData } from "@/components/IntakeForm";
import type { Appointment } from "@/services/MockAppointmentService";
import { MapPin, Star } from "lucide-react";

function postToParent(type: string) {
  if (typeof window !== "undefined" && window.parent !== window) {
    window.parent.postMessage({ type }, "*");
  }
}

function ProviderMiniHeader({ provider }: { provider: Provider }) {
  const initials = provider.name
    .replace("Dr. ", "")
    .split(" ")
    .map((w) => w[0])
    .join("");

  return (
    <div className="flex items-center gap-3 p-4 border-b border-border">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
        style={{ backgroundColor: provider.theme?.primaryColor ?? "#0D9488" }}
      >
        {initials}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {provider.name}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{provider.specialty}</span>
          <span className="inline-flex items-center gap-0.5">
            <MapPin className="w-3 h-3" />
            {provider.location.city}, {provider.location.state}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function EmbedPage({
  params,
}: {
  params: Promise<{ providerId: string }>;
}) {
  const { providerId } = use(params);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [notFound, setNotFound] = useState(false);
  const { hold, secondsLeft, placeHold, releaseHold } = useSoftHold();
  const [confirmed, setConfirmed] = useState<Appointment | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const p = MockProviderService.getById(providerId);
    if (p) {
      setProvider(p);
    } else {
      setNotFound(true);
    }
  }, [providerId]);

  // Listen for WIDGET_RESET from parent (backdrop click / close button)
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "WIDGET_RESET") {
        releaseHold();
        setConfirmed(null);
        setError(null);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [releaseHold]);

  // Apply provider theme color as CSS variable
  useEffect(() => {
    if (provider?.theme?.primaryColor) {
      document.documentElement.style.setProperty(
        "--color-primary",
        provider.theme.primaryColor
      );
    }
    return () => {
      document.documentElement.style.removeProperty("--color-primary");
    };
  }, [provider]);

  function handleSlotSelect(date: Date, time: string) {
    placeHold(date, time);
    setError(null);
    postToParent("WIDGET_EXPAND");
  }

  function handleRelease() {
    releaseHold();
    setError(null);
    postToParent("WIDGET_COLLAPSE");
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
      setError(null);
      setConfirmed(appointment);
    } catch {
      setError("Something went wrong. Please try again.");
    }
  }

  function handleBookAnother() {
    setConfirmed(null);
    setError(null);
    postToParent("WIDGET_COLLAPSE");
  }

  function handleClose() {
    releaseHold();
    setConfirmed(null);
    setError(null);
    postToParent("WIDGET_COLLAPSE");
  }

  if (notFound) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        Provider not found.
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <ProviderMiniHeader provider={provider} />

      <div className="p-4 space-y-4">
        {confirmed ? (
          <>
            <Confirmation
              appointment={confirmed}
              onBookAnother={handleBookAnother}
            />
            <button
              onClick={handleClose}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Close
            </button>
          </>
        ) : (
          <>
            <AppointmentPicker onSlotSelect={handleSlotSelect} />

            {hold && (
              <div className="space-y-4">
                <SoftHoldBanner
                  date={hold.date}
                  time={hold.time}
                  secondsLeft={secondsLeft}
                  onRelease={handleRelease}
                />
                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                    {error}
                  </div>
                )}
                <IntakeForm onSubmit={handleIntakeSubmit} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
