import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { normalizeDomain, normalizeEmail } from "@/lib/security/normalization";
import { logActivity } from "@/lib/audit/logger";

export async function GET() {
  try {
    const suppressions = await db.suppression.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ suppressions });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error listing suppressions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, domain, reason, source } = body;

    if (!email && !domain) {
      return NextResponse.json(
        { error: "Either email or domain is required to add suppression." },
        { status: 400 }
      );
    }

    const normEmail = email ? normalizeEmail(email) : null;
    const normDomain = domain ? normalizeDomain(domain) : null;

    // Check if already exists
    const existing = await db.suppression.findFirst({
      where: {
        OR: [
          ...(normEmail ? [{ normalizedEmail: normEmail }] : []),
          ...(normDomain ? [{ normalizedDomain: normDomain }] : []),
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This email or domain is already on the suppression list." },
        { status: 409 }
      );
    }

    const suppression = await db.suppression.create({
      data: {
        normalizedEmail: normEmail,
        normalizedDomain: normDomain,
        reason: reason?.trim() || "User requested opt-out",
        source: source || "USER_OPT_OUT",
      },
    });

    await logActivity({
      action: "SUPPRESSION_ADDED",
      entityType: "SUPPRESSION",
      entityId: suppression.id,
      metadata: { email: normEmail, domain: normDomain, reason: suppression.reason },
    });

    return NextResponse.json({ suppression }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error adding suppression";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
