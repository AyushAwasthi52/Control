import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "30", 10);

    const logs = await db.activityLog.findMany({
      take: Math.min(limit, 100),
      orderBy: { timestamp: "desc" },
    });

    return NextResponse.json({ logs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching activity logs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
