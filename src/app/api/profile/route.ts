import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { logActivity } from "@/lib/audit/logger";

export async function GET() {
  try {
    let profile = await db.userProfile.findUnique({
      where: { id: "default-user" },
    });

    if (!profile) {
      profile = await db.userProfile.create({
        data: {
          id: "default-user",
          displayName: "Ayush",
          country: "India",
          genuineBackground: "Computer Science student and PC gamer",
          interests: "Controllers, mechanical keyboards, Hall effect sticks",
          portfolioLinks: "[]",
          approvedSignature: "Best regards,\nAyush\nComputer Science Student\nIndia",
        },
      });
    }

    return NextResponse.json({ profile });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    if (body.displayName) updateData.displayName = body.displayName.trim();
    if (body.country) updateData.country = body.country.trim();
    if (body.genuineBackground) updateData.genuineBackground = body.genuineBackground.trim();
    if (body.interests) updateData.interests = body.interests.trim();
    if (body.approvedSignature) updateData.approvedSignature = body.approvedSignature.trim();
    if (body.portfolioLinks) {
      updateData.portfolioLinks = typeof body.portfolioLinks === "string"
        ? body.portfolioLinks
        : JSON.stringify(body.portfolioLinks);
    }

    const updated = await db.userProfile.upsert({
      where: { id: "default-user" },
      update: updateData,
      create: {
        id: "default-user",
        displayName: body.displayName || "Ayush",
        country: body.country || "India",
        genuineBackground: body.genuineBackground || "Computer Science student and PC gamer",
        interests: body.interests || "Controllers, mechanical keyboards",
        portfolioLinks: JSON.stringify(body.portfolioLinks || []),
        approvedSignature: body.approvedSignature || "Best regards,\nAyush",
      },
    });

    await logActivity({
      action: "PROFILE_UPDATED",
      entityType: "SYSTEM",
      entityId: "default-user",
      metadata: updateData,
    });

    return NextResponse.json({ profile: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
