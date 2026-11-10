import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const companyId = searchParams.get("companyId");

    const where: Record<string, unknown> = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (companyId) {
      where.companyId = companyId;
    }

    const drafts = await db.emailDraft.findMany({
      where,
      include: {
        company: {
          select: { id: true, name: true, website: true, categories: true },
        },
        contact: {
          select: { id: true, email: true, contactType: true, verificationStatus: true },
        },
        messages: {
          orderBy: { sentAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ drafts });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error listing drafts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
