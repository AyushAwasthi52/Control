import { describe, it, expect } from "vitest";
import { normalizeDomain, normalizeEmail, normalizeName, isPotentialDuplicate } from "@/lib/security/normalization";

describe("Normalization and Duplicate Detection", () => {
  it("normalizes domains by removing protocols, subdomains, paths, and queries", () => {
    expect(normalizeDomain("https://www.8bitdo.com/ultimate-controller?ref=1")).toBe("8bitdo.com");
    expect(normalizeDomain("http://flydigi.com/")).toBe("flydigi.com");
    expect(normalizeDomain("WWW.PULSAR.GG/PRODUCTS/")).toBe("pulsar.gg");
    expect(normalizeDomain("https://sub.brand.co.uk:8080/path")).toBe("sub.brand.co.uk");
  });

  it("normalizes email addresses to lowercase", () => {
    expect(normalizeEmail("  Support@8BitDo.COM ")).toBe("support@8bitdo.com");
    expect(normalizeEmail("PR@FLYDIGI.CN")).toBe("pr@flydigi.cn");
  });

  it("normalizes brand names by stripping special characters and whitespace", () => {
    expect(normalizeName("8BitDo")).toBe("8bitdo");
    expect(normalizeName("Pulsar Gaming Gears!")).toBe("pulsargaminggears");
    expect(normalizeName("GameSir - Pro")).toBe("gamesirpro");
  });

  it("accurately detects duplicates based on normalized names and domains", () => {
    const existing = {
      normalizedName: "8bitdo",
      normalizedDomain: "8bitdo.com",
    };

    expect(isPotentialDuplicate(existing, { name: "8BitDo", domain: "https://8bitdo.com" })).toBe(true);
    expect(isPotentialDuplicate(existing, { name: "8-Bit-Do", domain: "https://different.com" })).toBe(true);
    expect(isPotentialDuplicate(existing, { name: "Other Brand", domain: "8bitdo.com/products" })).toBe(true);
    expect(isPotentialDuplicate(existing, { name: "Flydigi", domain: "flydigi.com" })).toBe(false);
  });
});
