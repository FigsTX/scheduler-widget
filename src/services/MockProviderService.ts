export interface Provider {
  id: string;
  name: string;
  avatarUrl: string;
  specialty: string;
  location: { city: string; state: string };
  availability: {
    days: number[]; // 0=Sun, 1=Mon, ...
    hours: { start: string; end: string };
  };
  theme?: {
    primaryColor: string;
  };
}

const PROVIDERS: Provider[] = [
  {
    id: "dr-sarah-smith",
    name: "Dr. Sarah Smith",
    avatarUrl: "/avatars/sarah-smith.jpg",
    specialty: "Family Medicine",
    location: { city: "Austin", state: "TX" },
    availability: {
      days: [1, 2, 3, 4, 5],
      hours: { start: "09:00", end: "17:00" },
    },
    theme: { primaryColor: "#0D9488" },
  },
  {
    id: "dr-james-chen",
    name: "Dr. James Chen",
    avatarUrl: "/avatars/james-chen.jpg",
    specialty: "Internal Medicine",
    location: { city: "Dallas", state: "TX" },
    availability: {
      days: [1, 2, 3, 4, 5],
      hours: { start: "08:00", end: "16:00" },
    },
    theme: { primaryColor: "#2563EB" },
  },
  {
    id: "dr-maria-gonzalez",
    name: "Dr. Maria Gonzalez",
    avatarUrl: "/avatars/maria-gonzalez.jpg",
    specialty: "Pediatrics",
    location: { city: "San Antonio", state: "TX" },
    availability: {
      days: [1, 3, 4, 5],
      hours: { start: "10:00", end: "18:00" },
    },
    theme: { primaryColor: "#7C3AED" },
  },
];

export const MockProviderService = {
  getAll(): Provider[] {
    return PROVIDERS;
  },

  getById(id: string): Provider | undefined {
    return PROVIDERS.find((p) => p.id === id);
  },

  getSlots(provider: Provider, date: Date): string[] {
    const day = date.getDay();
    if (!provider.availability.days.includes(day)) return [];

    const { start, end } = provider.availability.hours;
    const startHour = parseInt(start.split(":")[0], 10);
    const endHour = parseInt(end.split(":")[0], 10);
    const slots: string[] = [];

    for (let h = startHour; h < endHour; h++) {
      slots.push(
        `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? "PM" : "AM"}`,
        `${h > 12 ? h - 12 : h}:30 ${h >= 12 ? "PM" : "AM"}`
      );
    }

    return slots;
  },
};
