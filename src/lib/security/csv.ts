import Papa from "papaparse";
import { z } from "zod";
import { normalizeDomain, normalizeName, normalizeEmail } from "./normalization";

export const CsvLeadRowSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  website: z.string().optional().default(""),
  country: z.string().optional().default(""),
  categories: z.string().optional().default(""),
  description: z.string().optional().default(""),
  contactEmail: z.string().optional().default(""),
  contactType: z.string().optional().default("GENERAL"),
  sourceUrl: z.string().optional().default(""),
});

export type CsvLeadRow = z.infer<typeof CsvLeadRowSchema>;

/**
 * Sanitizes a cell for CSV export to prevent formula injection / DDE attacks.
 * If the string starts with =, +, -, @, tab, or carriage return, it prefixes with an apostrophe '.
 */
export function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

export function parseAndValidateCsv(csvText: string): {
  validRows: Array<{
    name: string;
    normalizedName: string;
    website?: string;
    normalizedDomain?: string;
    country?: string;
    categories: string[];
    description?: string;
    contact?: {
      email: string;
      normalizedEmail: string;
      contactType: string;
      sourceUrl?: string;
    };
  }>;
  errors: Array<{ rowNumber: number; message: string }>;
} {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const validRows: Array<{
    name: string;
    normalizedName: string;
    website?: string;
    normalizedDomain?: string;
    country?: string;
    categories: string[];
    description?: string;
    contact?: {
      email: string;
      normalizedEmail: string;
      contactType: string;
      sourceUrl?: string;
    };
  }> = [];
  const errors: Array<{ rowNumber: number; message: string }> = [];

  parsed.data.forEach((row, index) => {
    const rowNumber = index + 2; // account for 1-indexed and header row
    
    // Support flexible header naming
    const name = row["name"] || row["Company"] || row["Company Name"] || row["Brand"] || "";
    const website = row["website"] || row["Website"] || row["URL"] || "";
    const country = row["country"] || row["Country"] || row["Region"] || "";
    const categoriesStr = row["categories"] || row["Categories"] || row["Category"] || "";
    const description = row["description"] || row["Description"] || "";
    const contactEmail = row["email"] || row["contactEmail"] || row["Contact Email"] || row["Email"] || "";
    const contactType = row["contactType"] || row["Contact Type"] || "GENERAL";
    const sourceUrl = row["sourceUrl"] || row["Source URL"] || website || "";

    const parsedResult = CsvLeadRowSchema.safeParse({
      name,
      website,
      country,
      categories: categoriesStr,
      description,
      contactEmail,
      contactType,
      sourceUrl,
    });

    if (!parsedResult.success) {
      const issues = parsedResult.error.issues;
      errors.push({
        rowNumber,
        message: issues.map((e) => `${e.path.join(".") || "field"}: ${e.message}`).join(", "),
      });
      return;
    }

    const data = parsedResult.data;
    const normDomain = data.website ? normalizeDomain(data.website) : undefined;
    const normName = normalizeName(data.name);

    // Parse categories from comma or semicolon separated string
    const categories = data.categories
      ? data.categories.split(/[,;|]/).map((c) => c.trim()).filter(Boolean)
      : [];

    let contact: {
      email: string;
      normalizedEmail: string;
      contactType: string;
      sourceUrl?: string;
    } | undefined = undefined;

    if (data.contactEmail && data.contactEmail.includes("@")) {
      contact = {
        email: data.contactEmail.trim(),
        normalizedEmail: normalizeEmail(data.contactEmail),
        contactType: data.contactType || "GENERAL",
        sourceUrl: data.sourceUrl || data.website || undefined,
      };
    }

    validRows.push({
      name: data.name.trim(),
      normalizedName: normName,
      website: data.website ? data.website.trim() : undefined,
      normalizedDomain: normDomain,
      country: data.country ? data.country.trim() : undefined,
      categories,
      description: data.description ? data.description.trim() : undefined,
      contact,
    });
  });

  return { validRows, errors };
}
