import { NextResponse } from "next/server";
import { getProviderBySlug } from "@/services/ProviderService";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const provider = await getProviderBySlug(slug);

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(provider);
  } catch (error) {
    console.error("Failed to fetch provider:", error);
    return NextResponse.json(
      { error: "Failed to fetch provider" },
      { status: 500 }
    );
  }
}
