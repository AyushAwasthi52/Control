import { NextRequest, NextResponse } from "next/server";
import { sendApprovedDraft } from "@/lib/email/service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const idempotencyKey = body.idempotencyKey || req.headers.get("x-idempotency-key") || undefined;

    const result = await sendApprovedDraft({
      draftId: id,
      idempotencyKey,
      actor: "user",
      preferredProvider: body.provider,
      autoApprove: body.autoApprove ?? true,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.message,
          result: result.result,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      emailMessageId: result.emailMessageId,
      result: result.result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error sending draft";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
