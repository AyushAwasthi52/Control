import { describe, it, expect } from "vitest";
import { sanitizeCsvCell, parseAndValidateCsv } from "@/lib/security/csv";

describe("CSV Parsing and Formula Injection Protection", () => {
  it("sanitizes dangerous spreadsheet formula prefixes on export", () => {
    // Formula prefixes: =, +, -, @, tab, return
    expect(sanitizeCsvCell("=SUM(1,2)")).toBe("'=SUM(1,2)");
    expect(sanitizeCsvCell("+1234567890")).toBe("'+1234567890");
    expect(sanitizeCsvCell("-cmd|'/C calc'!A0")).toBe("'-cmd|'/C calc'!A0");
    expect(sanitizeCsvCell("@SUM(A1:A10)")).toBe("'@SUM(A1:A10)");
    expect(sanitizeCsvCell("\tmalicious")).toBe("'\tmalicious");

    // Safe strings should remain unchanged
    expect(sanitizeCsvCell("8BitDo Ultimate Controller")).toBe("8BitDo Ultimate Controller");
    expect(sanitizeCsvCell("support@8bitdo.com")).toBe("support@8bitdo.com");
  });

  it("parses valid CSV lead rows with headers correctly", () => {
    const csvContent = `Company,Website,Country,Categories,Email
8BitDo,https://8bitdo.com,Hong Kong,"Controllers, Keyboards",support@8bitdo.com
Flydigi,https://flydigi.com,China,Controllers,pr@flydigi.com`;

    const { validRows, errors } = parseAndValidateCsv(csvContent);
    expect(errors).toHaveLength(0);
    expect(validRows).toHaveLength(2);

    expect(validRows[0].name).toBe("8BitDo");
    expect(validRows[0].normalizedDomain).toBe("8bitdo.com");
    expect(validRows[0].categories).toEqual(["Controllers", "Keyboards"]);
    expect(validRows[0].contact?.email).toBe("support@8bitdo.com");
  });

  it("flags malformed or missing required company names", () => {
    const badCsv = `Company,Website
,https://noname.com`;

    const { validRows, errors } = parseAndValidateCsv(badCsv);
    expect(validRows).toHaveLength(0);
    expect(errors.length).toBeGreaterThan(0);
  });
});
