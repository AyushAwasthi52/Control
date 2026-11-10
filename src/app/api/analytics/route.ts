import { NextResponse } from "next/server";
import { calculateAnalytics } from "@/lib/analytics/metrics";

export async function GET() {
  try {
    const analytics = await calculateAnalytics();
    return NextResponse.json(analytics);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error calculating analytics";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
