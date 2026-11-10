import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { 
  searchCandidateBrands, 
  probeBrandWebsite, 
  crawlForNewPeripheralBrands, 
  CandidateBrand 
} from "@/lib/research/discovery";
import { logActivity } from "@/lib/audit/logger";
import { normalizeDomain, normalizeName, normalizeEmail } from "@/lib/security/normalization";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const category = searchParams.get("category") || "ALL";
    const limit = parseInt(searchParams.get("limit") || "16", 10);
    const dynamic = searchParams.get("dynamic") === "true";

    // Get all existing company normalized names & domains to exclude them
    const existing = await db.company.findMany({
      select: { normalizedName: true, normalizedDomain: true },
    });

    const existingNames = new Set(existing.map((c) => c.normalizedName));
    const existingDomains = new Set(
      existing.map((c) => c.normalizedDomain).filter(Boolean) as string[]
    );

    let candidates = searchCandidateBrands(
      query,
      category,
      existingDomains,
      existingNames,
      limit
    );

    // If dynamic crawl is explicitly requested or directory has fewer candidates than requested,
    // trigger dynamic web discovery to supplement brand candidates
    if (dynamic || candidates.length === 0) {
      const crawled = await crawlForNewPeripheralBrands(
        category,
        existingDomains,
        existingNames,
        Math.max(4, limit - candidates.length)
      );

      // Append freshly crawled candidates
      candidates = [...candidates, ...crawled];
    }

    return NextResponse.json({
      candidates,
      totalAvailable: candidates.length,
      category,
      query,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error discovering brands";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // Action 1: Dynamic web crawl for new peripheral manufacturers
    if (action === "crawl") {
      const category = body.category || "ALL";
      const limit = parseInt(body.limit || "8", 10);

      const existing = await db.company.findMany({
        select: { normalizedName: true, normalizedDomain: true },
      });

      const existingNames = new Set(existing.map((c) => c.normalizedName));
      const existingDomains = new Set(
        existing.map((c) => c.normalizedDomain).filter(Boolean) as string[]
      );

      const crawled = await crawlForNewPeripheralBrands(
        category,
        existingDomains,
        existingNames,
        limit
      );

      return NextResponse.json({
        success: true,
        crawled,
        count: crawled.length,
      });
    }

    // Action 2: Probe a website live
    if (action === "probe") {
      const { websiteUrl } = body;
      if (!websiteUrl) {
        return NextResponse.json({ error: "websiteUrl is required" }, { status: 400 });
      }
      const probeResult = await probeBrandWebsite(websiteUrl);
      return NextResponse.json(probeResult);
    }

    // Action 3: Commit one or more discovered candidate brands
    if (action === "commit") {
      const { brands } = body as { brands: CandidateBrand[] };
      if (!Array.isArray(brands) || brands.length === 0) {
        return NextResponse.json({ error: "brands array is required" }, { status: 400 });
      }

      const imported: any[] = [];
      const skipped: string[] = [];

      for (const brand of brands) {
        const normName = normalizeName(brand.name);
        const normDomain = normalizeDomain(brand.website);

        // Check duplicate
        const existing = await db.company.findFirst({
          where: {
            OR: [
              { normalizedName: normName },
              ...(normDomain ? [{ normalizedDomain: normDomain }] : []),
            ],
          },
        });

        if (existing) {
          skipped.push(brand.name);
          continue;
        }

        const company = await db.company.create({
          data: {
            name: brand.name,
            normalizedName: normName,
            website: brand.website,
            normalizedDomain: normDomain,
            country: brand.country,
            categories: JSON.stringify(brand.categories),
            description: brand.description,
            status: brand.suggestedContact ? "CONTACT_FOUND" : "RESEARCHED",
            ...(brand.suggestedContact
              ? {
                  contacts: {
                    create: {
                      email: brand.suggestedContact.email,
                      normalizedEmail: normalizeEmail(brand.suggestedContact.email),
                      contactType: brand.suggestedContact.contactType || "PR",
                      sourceUrl: brand.suggestedContact.sourceUrl || brand.website,
                      sourceCheckedAt: new Date(),
                      verificationStatus: "VERIFIED",
                      notes: brand.suggestedContact.notes,
                    },
                  },
                }
              : {}),
            researchRecords: {
              create: {
                sourceUrl: brand.website,
                sourceType: "OFFICIAL_WEBSITE",
                facts: JSON.stringify({
                  keyProducts: brand.keyProducts || [],
                  innovations: brand.innovations || [],
                  notes: brand.description,
                }),
                confidence: "VERIFIED",
              },
            },
          },
          include: {
            contacts: true,
            researchRecords: true,
          },
        });

        imported.push(company);

        await logActivity({
          action: "BRAND_DYNAMICALLY_DISCOVERED",
          entityType: "COMPANY",
          entityId: company.id,
          metadata: {
            name: company.name,
            domain: normDomain,
            contactAdded: !!brand.suggestedContact,
          },
        });
      }

      return NextResponse.json({
        success: true,
        importedCount: imported.length,
        skippedCount: skipped.length,
        imported,
        skipped,
      });
    }

    return NextResponse.json({ error: "Invalid action. Use 'probe' or 'commit'" }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error committing discovered brands";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
