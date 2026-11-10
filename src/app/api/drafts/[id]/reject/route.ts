import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { logActivity } from "@/lib/audit/logger";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || "Rejected by reviewer.";

    const draft = await db.emailDraft.findUnique({ where: { id } });
    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    const updated = await db.emailDraft.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
        rejectionReason: reason,
        approvedAt: null,
        approvedVersion: null,
      },
    });

    await logActivity({
      action: "DRAFT_REJECTED",
      entityType: "DRAFT",
      entityId: id,
      metadata: { reason, version: draft.version },
    });

    return NextResponse.json({
      success: true,
      message: "Draft marked as rejected.",
      draft: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error rejecting draft";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
