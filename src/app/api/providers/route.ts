import { NextResponse } from "next/server";
import { getAllProviders } from "@/services/ProviderService";

export async function GET() {
  try {
    const providers = await getAllProviders();
    return NextResponse.json(providers);
  } catch (error) {
    console.error("Failed to fetch providers:", error);
    return NextResponse.json(
      { error: "Failed to fetch providers" },
      { status: 500 }
    );
  }
}
