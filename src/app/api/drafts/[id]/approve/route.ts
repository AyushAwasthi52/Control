import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { logActivity } from "@/lib/audit/logger";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const draft = await db.emailDraft.findUnique({
      where: { id },
      include: { contact: true, company: true },
    });

    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    if (draft.status === "SENT") {
      return NextResponse.json({ error: "Draft has already been sent." }, { status: 400 });
    }

    // Approve the exact current version
    const updatedDraft = await db.emailDraft.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedVersion: draft.version,
        approvedAt: new Date(),
        rejectedAt: null,
        rejectionReason: null,
      },
      include: {
        company: true,
        contact: true,
      },
    });

    await logActivity({
      action: "DRAFT_APPROVED",
      entityType: "DRAFT",
      entityId: id,
      metadata: {
        version: draft.version,
        recipient: draft.contact.email,
        companyName: draft.company.name,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Draft v${draft.version} approved for sending.`,
      draft: updatedDraft,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error approving draft";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
