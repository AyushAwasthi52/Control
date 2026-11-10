import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { logActivity } from "@/lib/audit/logger";
import { verifyDraftClaims } from "@/lib/drafting/generator";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const draft = await db.emailDraft.findUnique({
      where: { id },
      include: {
        company: {
          include: {
            researchRecords: { orderBy: { researchedAt: "desc" } },
            contacts: true,
          },
        },
        contact: true,
        messages: { orderBy: { sentAt: "desc" } },
      },
    });

    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    return NextResponse.json({ draft });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching draft";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existingDraft = await db.emailDraft.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!existingDraft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    if (existingDraft.status === "SENT") {
      return NextResponse.json(
        { error: "Cannot edit a draft that has already been sent." },
        { status: 400 }
      );
    }

    const newSubject = body.subject !== undefined ? body.subject : existingDraft.subject;
    const newBody = body.body !== undefined ? body.body : existingDraft.body;
    const newContactId = body.contactId !== undefined ? body.contactId : existingDraft.contactId;

    // Check if material content changed
    const contentChanged =
      newSubject !== existingDraft.subject ||
      newBody !== existingDraft.body ||
      newContactId !== existingDraft.contactId;

    // Increment version if edited
    const newVersion = contentChanged ? existingDraft.version + 1 : existingDraft.version;

    // CRITICAL: Any edit after approval INVALIDATES the approval and resets status to NEEDS_REVIEW!
    const newStatus = contentChanged ? "NEEDS_REVIEW" : existingDraft.status;
    const approvedVersion = contentChanged ? null : existingDraft.approvedVersion;
    const approvedAt = contentChanged ? null : existingDraft.approvedAt;

    // Perform claim verification
    const claimCheck = verifyDraftClaims(newBody, [], existingDraft.company.name);

    const updatedDraft = await db.emailDraft.update({
      where: { id },
      data: {
        subject: newSubject,
        body: newBody,
        contactId: newContactId,
        status: newStatus,
        version: newVersion,
        editedAt: new Date(),
        approvedVersion,
        approvedAt,
      },
      include: {
        company: true,
        contact: true,
      },
    });

    if (contentChanged) {
      await logActivity({
        action: "DRAFT_EDITED_APPROVAL_INVALIDATED",
        entityType: "DRAFT",
        entityId: id,
        metadata: {
          previousVersion: existingDraft.version,
          newVersion,
          previousStatus: existingDraft.status,
          newStatus,
          warnings: claimCheck.warnings,
        },
      });
    }

    return NextResponse.json({
      draft: updatedDraft,
      versionIncremented: contentChanged,
      approvalInvalidated: contentChanged && existingDraft.status === "APPROVED",
      claimWarnings: claimCheck.warnings,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error editing draft";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
