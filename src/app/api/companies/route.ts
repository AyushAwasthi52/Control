import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { normalizeDomain, normalizeName } from "@/lib/security/normalization";
import { logActivity } from "@/lib/audit/logger";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim().toLowerCase() || "";
    const category = searchParams.get("category")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const country = searchParams.get("country")?.trim() || "";

    const where: Record<string, unknown> = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (country) {
      where.country = country;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { normalizedDomain: { contains: search } },
      ];
    }

    const companies = await db.company.findMany({
      where,
      include: {
        contacts: true,
        researchRecords: {
          orderBy: { researchedAt: "desc" },
          take: 1,
        },
        drafts: {
          select: { id: true, status: true, version: true },
        },
        _count: {
          select: { contacts: true, drafts: true, responses: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // In-memory filter for category array in SQLite JSON
    const filtered = category && category !== "ALL"
      ? companies.filter((c) => {
          try {
            const cats = JSON.parse(c.categories);
            return Array.isArray(cats) && cats.includes(category);
          } catch {
            return false;
          }
        })
      : companies;

    return NextResponse.json({
      companies: filtered,
      total: filtered.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching companies";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, website, country, categories, description, contactEmail, contactType } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Company name is required." }, { status: 400 });
    }

    const normName = normalizeName(name);
    const normDomain = website ? normalizeDomain(website) : null;

    // Check duplicate
    if (normDomain) {
      const existing = await db.company.findFirst({
        where: { normalizedDomain: normDomain },
      });
      if (existing) {
        return NextResponse.json(
          { error: `A company with domain "${normDomain}" already exists (${existing.name}).` },
          { status: 409 }
        );
      }
    }

    const existingName = await db.company.findFirst({
      where: { normalizedName: normName },
    });
    if (existingName) {
      return NextResponse.json(
        { error: `A company with the name "${existingName.name}" already exists.` },
        { status: 409 }
      );
    }

    const catsArray = Array.isArray(categories)
      ? categories
      : typeof categories === "string"
      ? categories.split(",").map((c) => c.trim()).filter(Boolean)
      : [];

    const company = await db.company.create({
      data: {
        name: name.trim(),
        normalizedName: normName,
        website: website?.trim() || null,
        normalizedDomain: normDomain,
        country: country?.trim() || null,
        categories: JSON.stringify(catsArray),
        description: description?.trim() || null,
        status: contactEmail ? "CONTACT_FOUND" : "NEW",
        ...(contactEmail
          ? {
              contacts: {
                create: {
                  email: contactEmail.trim(),
                  normalizedEmail: contactEmail.trim().toLowerCase(),
                  contactType: contactType || "GENERAL",
                  sourceUrl: website?.trim() || null,
                  verificationStatus: "UNVERIFIED",
                },
              },
            }
          : {}),
      },
      include: {
        contacts: true,
      },
    });

    await logActivity({
      action: "COMPANY_CREATED",
      entityType: "COMPANY",
      entityId: company.id,
      metadata: { name: company.name, domain: normDomain },
    });

    return NextResponse.json({ company }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error creating company";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
