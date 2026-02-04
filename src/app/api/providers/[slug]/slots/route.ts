import { NextResponse } from "next/server";
import { getProviderBySlug } from "@/services/ProviderService";
import { getSlots } from "@/services/AvailabilityService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const url = new URL(request.url);
    const dateParam = url.searchParams.get("date");

    if (!dateParam) {
      return NextResponse.json(
        { error: "Missing 'date' query parameter (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const provider = await getProviderBySlug(slug);
    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    const date = new Date(dateParam + "T00:00:00");
    const slots = await getSlots(provider, date);

    return NextResponse.json({ date: dateParam, slots });
  } catch (error) {
    console.error("Failed to fetch slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
