import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { normalizeEmail } from "@/lib/security/normalization";
import { logActivity } from "@/lib/audit/logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyId, email, contactType, sourceUrl, verificationStatus, notes } = body;

    if (!companyId || !email) {
      return NextResponse.json({ error: "companyId and email are required." }, { status: 400 });
    }

    if (!email.includes("@")) {
      return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
    }

    const normEmail = normalizeEmail(email);

    // Verify company exists
    const company = await db.company.findUnique({ where: { id: companyId } });
    if (!company) {
      return NextResponse.json({ error: "Company not found." }, { status: 404 });
    }

    // Check duplicate contact for this company
    const existing = await db.contact.findFirst({
      where: {
        companyId,
        normalizedEmail: normEmail,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This contact email already exists for this company." },
        { status: 409 }
      );
    }

    const contact = await db.contact.create({
      data: {
        companyId,
        email: email.trim(),
        normalizedEmail: normEmail,
        contactType: contactType || "GENERAL",
        sourceUrl: sourceUrl?.trim() || null,
        sourceCheckedAt: new Date(),
        verificationStatus: verificationStatus || "UNVERIFIED",
        notes: notes?.trim() || null,
      },
    });

    // Update company status if it was NEW
    if (company.status === "NEW") {
      await db.company.update({
        where: { id: companyId },
        data: { status: "CONTACT_FOUND" },
      });
    }

    await logActivity({
      action: "CONTACT_ADDED",
      entityType: "CONTACT",
      entityId: contact.id,
      metadata: { companyId, email: contact.email, type: contact.contactType },
    });

    return NextResponse.json({ contact }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error creating contact";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
