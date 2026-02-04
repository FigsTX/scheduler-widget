import { NextResponse } from "next/server";
import { getProviderBySlug } from "@/services/ProviderService";
import { bookAppointment } from "@/services/BookingService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { providerSlug, date, time, patientName, visitReason, phone, email } =
      body;

    if (!providerSlug || !date || !time || !patientName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const provider = await getProviderBySlug(providerSlug);
    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    const result = await bookAppointment({
      provider,
      date,
      time,
      patientName,
      visitReason: visitReason ?? "",
      phone: phone ?? "",
      email: email ?? "",
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Booking failed:", error);
    return NextResponse.json(
      { error: "Failed to book appointment" },
      { status: 500 }
    );
  }
}
