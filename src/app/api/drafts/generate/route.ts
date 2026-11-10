import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { generateFactualDraft, CompanyContext, UserContext } from "@/lib/drafting/generator";
import { logActivity } from "@/lib/audit/logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyId, contactId, category } = body;

    if (!companyId) {
      return NextResponse.json({ error: "companyId is required." }, { status: 400 });
    }

    const company = await db.company.findUnique({
      where: { id: companyId },
      include: {
        contacts: true,
        researchRecords: {
          orderBy: { researchedAt: "desc" },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found." }, { status: 404 });
    }

    // Select or validate contact
    let targetContact = company.contacts.find((c) => c.id === contactId);
    if (!targetContact && company.contacts.length > 0) {
      // Pick first verified or first available
      targetContact = company.contacts.find((c) => c.verificationStatus === "VERIFIED") || company.contacts[0];
    }

    if (!targetContact) {
      return NextResponse.json(
        { error: "This company has no business contacts yet. Please add a contact channel before drafting." },
        { status: 400 }
      );
    }

    // Fetch user profile
    const profile = await db.userProfile.findUnique({
      where: { id: "default-user" },
    });

    const userContext: UserContext = {
      displayName: profile?.displayName || "Ayush",
      country: profile?.country || "India",
      genuineBackground: profile?.genuineBackground || "Computer Science student and PC gamer",
      interests: profile?.interests || "Controllers and esports peripherals",
      approvedSignature: profile?.approvedSignature || "Best regards,\nAyush\nComputer Science Student\nIndia",
    };

    let categories: string[] = [];
    try {
      categories = JSON.parse(company.categories);
    } catch {
      categories = [];
    }

    const companyContext: CompanyContext = {
      id: company.id,
      name: company.name,
      website: company.website,
      categories,
      description: company.description,
      facts: company.researchRecords.map((r) => {
        let factsData = {};
        try {
          factsData = JSON.parse(r.facts);
        } catch {
          factsData = {};
        }
        return {
          sourceUrl: r.sourceUrl,
          factsData,
          confidence: r.confidence,
          researchedAt: r.researchedAt,
        };
      }),
    };

    const generated = generateFactualDraft(companyContext, userContext, category);

    // Persist draft in database with status NEEDS_REVIEW (never automatically sent!)
    const draft = await db.emailDraft.create({
      data: {
        companyId: company.id,
        contactId: targetContact.id,
        subject: generated.subject,
        body: generated.body,
        status: "NEEDS_REVIEW",
        version: 1,
      },
      include: {
        company: true,
        contact: true,
      },
    });

    await logActivity({
      action: "DRAFT_GENERATED",
      entityType: "DRAFT",
      entityId: draft.id,
      metadata: {
        companyName: company.name,
        contactEmail: targetContact.email,
        citedFactsCount: generated.citedFacts.length,
        warningsCount: generated.warnings.length,
      },
    });

    return NextResponse.json({
      draft,
      citedFacts: generated.citedFacts,
      warnings: generated.warnings,
    }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error generating draft";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
