import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { logActivity } from "@/lib/audit/logger";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData: Record<string, unknown> = {};
    if (body.verificationStatus) updateData.verificationStatus = body.verificationStatus;
    if (body.contactType) updateData.contactType = body.contactType;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.sourceUrl !== undefined) updateData.sourceUrl = body.sourceUrl;
    if (body.verified) {
      updateData.verificationStatus = "VERIFIED";
      updateData.sourceCheckedAt = new Date();
    }

    const updated = await db.contact.update({
      where: { id },
      data: updateData,
    });

    await logActivity({
      action: "CONTACT_UPDATED",
      entityType: "CONTACT",
      entityId: id,
      metadata: updateData,
    });

    return NextResponse.json({ contact: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating contact";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.contact.delete({ where: { id } });

    await logActivity({
      action: "CONTACT_DELETED",
      entityType: "CONTACT",
      entityId: id,
    });

    return NextResponse.json({ success: true, message: "Contact deleted." });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error deleting contact";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
