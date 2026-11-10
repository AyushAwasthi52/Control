import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { parseAndValidateCsv } from "@/lib/security/csv";
import { logActivity } from "@/lib/audit/logger";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const mode = (formData.get("mode") as string) || "commit"; // "preview" or "commit"

    if (!file) {
      return NextResponse.json({ error: "No CSV file provided." }, { status: 400 });
    }

    // Limit file size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds maximum size of 5MB." }, { status: 400 });
    }

    const text = await file.text();
    const { validRows, errors } = parseAndValidateCsv(text);

    if (validRows.length === 0 && errors.length > 0) {
      return NextResponse.json(
        { error: "No valid rows found in CSV file.", details: errors },
        { status: 400 }
      );
    }

    // Fetch existing companies to detect duplicates
    const existingCompanies = await db.company.findMany({
      select: { id: true, normalizedName: true, normalizedDomain: true, name: true },
    });

    const existingNames = new Set(existingCompanies.map((c) => c.normalizedName));
    const existingDomains = new Set(
      existingCompanies.map((c) => c.normalizedDomain).filter(Boolean) as string[]
    );

    const readyToImport: typeof validRows = [];
    const duplicates: Array<{ row: typeof validRows[0]; reason: string }> = [];

    for (const row of validRows) {
      if (row.normalizedDomain && existingDomains.has(row.normalizedDomain)) {
        duplicates.push({ row, reason: `Domain "${row.normalizedDomain}" already exists.` });
        continue;
      }
      if (existingNames.has(row.normalizedName)) {
        duplicates.push({ row, reason: `Company name "${row.name}" already exists.` });
        continue;
      }
      readyToImport.push(row);
      // Track newly added to avoid intra-batch duplicates
      if (row.normalizedDomain) existingDomains.add(row.normalizedDomain);
      existingNames.add(row.normalizedName);
    }

    // If preview mode, return preview stats without writing to DB
    if (mode === "preview") {
      return NextResponse.json({
        mode: "preview",
        totalRows: validRows.length + errors.length,
        validCount: validRows.length,
        readyToImportCount: readyToImport.length,
        duplicateCount: duplicates.length,
        duplicates,
        errors,
        sample: readyToImport.slice(0, 5),
      });
    }

    // Commit mode: Insert into database
    let importedCount = 0;
    for (const row of readyToImport) {
      await db.company.create({
        data: {
          name: row.name,
          normalizedName: row.normalizedName,
          website: row.website || null,
          normalizedDomain: row.normalizedDomain || null,
          country: row.country || null,
          categories: JSON.stringify(row.categories),
          description: row.description || null,
          status: row.contact ? "CONTACT_FOUND" : "NEW",
          ...(row.contact
            ? {
                contacts: {
                  create: {
                    email: row.contact.email,
                    normalizedEmail: row.contact.normalizedEmail,
                    contactType: row.contact.contactType,
                    sourceUrl: row.contact.sourceUrl || null,
                    verificationStatus: "UNVERIFIED",
                  },
                },
              }
            : {}),
        },
      });
      importedCount++;
    }

    await logActivity({
      action: "CSV_IMPORT_COMPLETED",
      entityType: "COMPANY",
      entityId: "batch",
      metadata: {
        totalRows: validRows.length,
        importedCount,
        duplicateCount: duplicates.length,
        errorCount: errors.length,
      },
    });

    return NextResponse.json({
      success: true,
      importedCount,
      duplicateCount: duplicates.length,
      errorCount: errors.length,
      duplicates,
      errors,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error processing CSV import";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
