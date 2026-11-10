import { describe, it, expect } from "vitest";
import { searchCandidateBrands, PERIPHERAL_BRAND_DIRECTORY } from "@/lib/research/discovery";

describe("Dynamic Brand Discovery Engine", () => {
  it("contains a diverse catalog of over 20 gaming peripheral manufacturers", () => {
    expect(PERIPHERAL_BRAND_DIRECTORY.length).toBeGreaterThanOrEqual(20);
  });

  it("filters candidate brands by category and excludes existing ones", () => {
    const existingDomains = new Set(["8bitdo.com", "flydigi.com"]);
    const existingNames = new Set(["8bitdo", "flydigi"]);

    const controllerCandidates = searchCandidateBrands(
      "",
      "CONTROLLERS",
      existingDomains,
      existingNames,
      10
    );

    expect(controllerCandidates.length).toBeGreaterThan(0);
    // Ensure existing brands are excluded
    expect(controllerCandidates.some((c) => c.name === "8BitDo")).toBe(false);
    expect(controllerCandidates.some((c) => c.name === "Flydigi")).toBe(false);
    // Ensure all returned brands are relevant
    expect(controllerCandidates.every((c) => c.categories.some((cat) => cat.toLowerCase().includes("controller")))).toBe(true);
  });

  it("matches brands based on hardware keyword queries (e.g. Rapid Trigger, Hall Effect)", () => {
    const existingDomains = new Set<string>();
    const existingNames = new Set<string>();

    const rapidTriggerBrands = searchCandidateBrands(
      "Rapid Trigger",
      "ALL",
      existingDomains,
      existingNames,
      10
    );

    expect(rapidTriggerBrands.length).toBeGreaterThan(0);
    expect(rapidTriggerBrands.some((b) => b.name === "Wooting" || b.name === "DrunkDeer")).toBe(true);
  });
});
