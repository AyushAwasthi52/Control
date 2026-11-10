import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { validateSafeUrl } from "@/lib/security/ssrf";
import { logActivity } from "@/lib/audit/logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyId, sourceUrl, sourceType, keyProducts, innovations, regions, notes, confidence } = body;

    if (!companyId) {
      return NextResponse.json({ error: "companyId is required." }, { status: 400 });
    }

    const company = await db.company.findUnique({ where: { id: companyId } });
    if (!company) {
      return NextResponse.json({ error: "Company not found." }, { status: 404 });
    }

    const urlToValidate = sourceUrl || company.website;
    if (urlToValidate) {
      const ssrfCheck = validateSafeUrl(urlToValidate);
      if (!ssrfCheck.safe) {
        return NextResponse.json(
          { error: `URL safety check failed: ${ssrfCheck.error}` },
          { status: 400 }
        );
      }
    }

    const factsData = {
      keyProducts: Array.isArray(keyProducts)
        ? keyProducts
        : typeof keyProducts === "string"
        ? keyProducts.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      innovations: Array.isArray(innovations)
        ? innovations
        : typeof innovations === "string"
        ? innovations.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      regions: Array.isArray(regions)
        ? regions
        : typeof regions === "string"
        ? regions.split(",").map((s) => s.trim()).filter(Boolean)
        : ["Global"],
      notes: notes || undefined,
    };

    const record = await db.researchRecord.create({
      data: {
        companyId,
        sourceUrl: urlToValidate || "manual-entry",
        sourceType: sourceType || "OFFICIAL_WEBSITE",
        facts: JSON.stringify(factsData),
        confidence: confidence || "VERIFIED",
      },
    });

    // Update company status if it was NEW
    if (company.status === "NEW") {
      await db.company.update({
        where: { id: companyId },
        data: { status: "RESEARCHED" },
      });
    }

    await logActivity({
      action: "RESEARCH_RECORDED",
      entityType: "COMPANY",
      entityId: companyId,
      metadata: { recordId: record.id, facts: factsData },
    });

    return NextResponse.json({ researchRecord: record }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error recording research";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
