import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { autoDispatchCompanyOutreach } from "@/lib/email/service";
import { normalizeDomain, normalizeName, normalizeEmail } from "@/lib/security/normalization";
import { CandidateBrand } from "@/lib/research/discovery";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { companyId, companyIds, candidateBrand, preferredProvider } = body;

    // Mode 1: Direct dispatch for a candidate brand (Discover & Dispatch in 1 click)
    if (candidateBrand) {
      const brand = candidateBrand as CandidateBrand;
      const normDomain = normalizeDomain(brand.website);
      const normName = normalizeName(brand.name);

      // Upsert company
      let company = await db.company.findFirst({
        where: {
          OR: [{ normalizedDomain: normDomain }, { normalizedName: normName }],
        },
      });

      if (!company) {
        company = await db.company.create({
          data: {
            name: brand.name,
            normalizedName: normName,
            website: brand.website,
            normalizedDomain: normDomain,
            country: brand.country,
            categories: JSON.stringify(brand.categories),
            description: brand.description,
            status: "CONTACT_FOUND",
          },
        });
      }

      // Ensure contact exists
      const targetContact = brand.suggestedContact;
      if (targetContact && targetContact.email) {
        const normEmail = normalizeEmail(targetContact.email);
        const existingContact = await db.contact.findFirst({
          where: { companyId: company.id, normalizedEmail: normEmail },
        });

        if (!existingContact) {
          await db.contact.create({
            data: {
              companyId: company.id,
              email: targetContact.email,
              normalizedEmail: normEmail,
              contactType: targetContact.contactType || "PR",
              sourceUrl: targetContact.sourceUrl || brand.website,
              sourceCheckedAt: new Date(),
              verificationStatus: "VERIFIED",
              notes: targetContact.notes || "Discovered via Autonomous Brand Directory",
            },
          });
        }
      }

      // Ensure research record exists
      if (brand.keyProducts || brand.innovations) {
        const existingResearch = await db.researchRecord.findFirst({
          where: { companyId: company.id },
        });

        if (!existingResearch) {
          await db.researchRecord.create({
            data: {
              companyId: company.id,
              sourceUrl: brand.website,
              sourceType: "OFFICIAL_WEBSITE",
              facts: JSON.stringify({
                keyProducts: brand.keyProducts || [],
                innovations: brand.innovations || [],
              }),
              confidence: "VERIFIED",
            },
          });
        }
      }

      // Automatically generate and dispatch outreach!
      const dispatchResult = await autoDispatchCompanyOutreach({
        companyId: company.id,
        actor: "auto-discover-dispatch",
        preferredProvider,
      });

      return NextResponse.json({
        success: dispatchResult.success,
        message: dispatchResult.message,
        company: { id: company.id, name: company.name },
        dispatch: dispatchResult,
      });
    }

    // Mode 2: Bulk dispatch for multiple company IDs
    if (Array.isArray(companyIds) && companyIds.length > 0) {
      const results = [];
      for (const id of companyIds) {
        const res = await autoDispatchCompanyOutreach({
          companyId: id,
          actor: "bulk-auto-dispatch",
          preferredProvider,
        });
        results.push({ companyId: id, ...res });
      }

      const successful = results.filter((r) => r.success).length;
      return NextResponse.json({
        success: successful > 0,
        message: `Autonomous dispatch complete: ${successful}/${results.length} emails dispatched via Gmail.`,
        dispatches: results,
      });
    }

    // Mode 3: Single company ID dispatch
    if (companyId) {
      const dispatchResult = await autoDispatchCompanyOutreach({
        companyId,
        actor: "dashboard-one-click",
        preferredProvider,
      });

      return NextResponse.json({
        success: dispatchResult.success,
        message: dispatchResult.message,
        dispatch: dispatchResult,
      });
    }

    return NextResponse.json(
      { error: "Provide companyId, companyIds array, or candidateBrand." },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error during autonomous dispatch";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
