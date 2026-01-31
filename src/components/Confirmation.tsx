"use client";

import { CheckCircle2, Calendar, Clock, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Appointment } from "@/services/MockAppointmentService";

interface ConfirmationProps {
  appointment: Appointment;
  onBookAnother: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function Confirmation({ appointment, onBookAnother }: ConfirmationProps) {
  const { patient } = appointment;
  const fullName = [patient.firstName, patient.middleName, patient.lastName, patient.suffix]
    .filter(Boolean)
    .join(" ");

  return (
    <Card className="p-6 rounded-xl text-center space-y-5">
      <div className="flex justify-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground">
          Appointment Confirmed
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Confirmation ID: <span className="font-mono text-xs">{appointment.id.slice(0, 8)}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
        <div className="flex items-start gap-2.5 bg-muted/50 rounded-xl p-3">
          <Calendar className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Date</p>
            <p className="text-sm font-medium text-foreground">
              {formatDate(appointment.date)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 bg-muted/50 rounded-xl p-3">
          <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Time</p>
            <p className="text-sm font-medium text-foreground">
              {appointment.time}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 bg-muted/50 rounded-xl p-3">
          <User className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Patient</p>
            <p className="text-sm font-medium text-foreground">
              {fullName}
            </p>
          </div>
        </div>
      </div>

      <Button
        onClick={onBookAnother}
        variant="outline"
        className="rounded-xl"
      >
        Book Another Appointment
      </Button>
    </Card>
  );
}
