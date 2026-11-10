import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { logActivity } from "@/lib/audit/logger";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await db.suppression.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Suppression record not found" }, { status: 404 });
    }

    await db.suppression.delete({ where: { id } });

    await logActivity({
      action: "SUPPRESSION_REMOVED",
      entityType: "SUPPRESSION",
      entityId: id,
      metadata: { email: existing.normalizedEmail, domain: existing.normalizedDomain },
    });

    return NextResponse.json({ success: true, message: "Suppression removed." });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error deleting suppression";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
