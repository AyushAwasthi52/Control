import { NextResponse } from "next/server";
import db from "@/lib/db";
import { sanitizeCsvCell } from "@/lib/security/csv";

export async function GET() {
  try {
    const companies = await db.company.findMany({
      include: {
        contacts: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const headers = ["Company Name", "Website", "Domain", "Country", "Categories", "Description", "Status", "Contact Email", "Contact Type", "Contact Verification"];
    
    const rows = [headers.join(",")];

    for (const c of companies) {
      let cats = "";
      try {
        const parsed = JSON.parse(c.categories);
        cats = Array.isArray(parsed) ? parsed.join("; ") : "";
      } catch {
        cats = c.categories;
      }

      const contact = c.contacts[0];

      const cells = [
        sanitizeCsvCell(c.name),
        sanitizeCsvCell(c.website || ""),
        sanitizeCsvCell(c.normalizedDomain || ""),
        sanitizeCsvCell(c.country || ""),
        sanitizeCsvCell(cats),
        sanitizeCsvCell(c.description || ""),
        sanitizeCsvCell(c.status),
        sanitizeCsvCell(contact?.email || ""),
        sanitizeCsvCell(contact?.contactType || ""),
        sanitizeCsvCell(contact?.verificationStatus || ""),
      ];

      // Escape quotes and wrap in quotes
      const escapedLine = cells
        .map((cell) => `"${cell.replace(/"/g, '""')}"`)
        .join(",");
      rows.push(escapedLine);
    }

    const csvContent = rows.join("\r\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="operation_free_controller_export_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error exporting companies";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
