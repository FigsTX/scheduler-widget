import { v4 as uuidv4 } from "uuid";
import type { IntakeFormData } from "@/components/IntakeForm";

export interface Appointment {
  id: string;
  date: string; // ISO date string
  time: string;
  patient: IntakeFormData;
  status: "confirmed" | "cancelled";
  createdAt: string;
}

const STORAGE_KEY = "patient_appointments";

function getAll(): Appointment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAll(appointments: Appointment[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
}

export const MockAppointmentService = {
  /** Create a new appointment and persist to localStorage */
  create(date: Date, time: string, patient: IntakeFormData): Appointment {
    const appointment: Appointment = {
      id: uuidv4(),
      date: date.toISOString(),
      time,
      patient,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    const all = getAll();
    all.push(appointment);
    saveAll(all);

    return appointment;
  },

  /** Get all appointments */
  getAll,

  /** Get a single appointment by ID */
  getById(id: string): Appointment | undefined {
    return getAll().find((a) => a.id === id);
  },

  /** Cancel an appointment */
  cancel(id: string): boolean {
    const all = getAll();
    const idx = all.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    all[idx].status = "cancelled";
    saveAll(all);
    return true;
  },
};
