import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { logActivity } from "@/lib/audit/logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyId, messageId, responseType, summary } = body;

    if (!companyId || !responseType || !summary) {
      return NextResponse.json(
        { error: "companyId, responseType, and summary are required." },
        { status: 400 }
      );
    }

    const response = await db.response.create({
      data: {
        companyId,
        messageId: messageId || null,
        responseType,
        summary: summary.trim(),
        isManual: true,
      },
      include: {
        company: true,
      },
    });

    await logActivity({
      action: "RESPONSE_RECORDED",
      entityType: "COMPANY",
      entityId: companyId,
      metadata: {
        responseId: response.id,
        type: responseType,
        summary,
      },
    });

    return NextResponse.json({ response }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error logging response";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
