import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    // Quick query to check DB connectivity
    await db.company.count();
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "operation-free-controller",
    });
  } catch {
    return NextResponse.json(
      { status: "unhealthy", timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
}
