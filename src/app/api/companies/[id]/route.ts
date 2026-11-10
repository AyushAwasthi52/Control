import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { normalizeDomain, normalizeName } from "@/lib/security/normalization";
import { logActivity } from "@/lib/audit/logger";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const company = await db.company.findUnique({
      where: { id },
      include: {
        contacts: {
          orderBy: { createdAt: "desc" },
        },
        researchRecords: {
          orderBy: { researchedAt: "desc" },
        },
        drafts: {
          include: {
            contact: true,
            messages: true,
          },
          orderBy: { createdAt: "desc" },
        },
        responses: {
          include: { message: true },
          orderBy: { receivedAt: "desc" },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({ company });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching company";
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

    const updateData: Record<string, unknown> = {};

    if (body.name) {
      updateData.name = body.name.trim();
      updateData.normalizedName = normalizeName(body.name);
    }
    if (body.website !== undefined) {
      updateData.website = body.website ? body.website.trim() : null;
      updateData.normalizedDomain = body.website ? normalizeDomain(body.website) : null;
    }
    if (body.country !== undefined) {
      updateData.country = body.country ? body.country.trim() : null;
    }
    if (body.description !== undefined) {
      updateData.description = body.description ? body.description.trim() : null;
    }
    if (body.status) {
      updateData.status = body.status;
    }
    if (body.categories) {
      const cats = Array.isArray(body.categories)
        ? body.categories
        : body.categories.split(",").map((c: string) => c.trim()).filter(Boolean);
      updateData.categories = JSON.stringify(cats);
    }

    const updated = await db.company.update({
      where: { id },
      data: updateData,
    });

    await logActivity({
      action: "COMPANY_UPDATED",
      entityType: "COMPANY",
      entityId: id,
      metadata: updateData,
    });

    return NextResponse.json({ company: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating company";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get("permanent") === "true";

    if (permanent) {
      await db.company.delete({ where: { id } });
      await logActivity({
        action: "COMPANY_DELETED",
        entityType: "COMPANY",
        entityId: id,
      });
      return NextResponse.json({ success: true, message: "Company permanently deleted." });
    } else {
      const archived = await db.company.update({
        where: { id },
        data: { status: "ARCHIVED" },
      });
      await logActivity({
        action: "COMPANY_ARCHIVED",
        entityType: "COMPANY",
        entityId: id,
      });
      return NextResponse.json({ success: true, company: archived });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error archiving company";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
