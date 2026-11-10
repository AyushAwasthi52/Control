import { describe, it, expect } from "vitest";
import { generateFactualDraft, verifyDraftClaims } from "@/lib/drafting/generator";

describe("Draft Generation and Claim Grounding", () => {
  const mockUser = {
    displayName: "Ayush",
    country: "India",
    genuineBackground: "Computer Science student and PC gamer in India",
    interests: "Hall effect controllers, low-latency esports mice",
    approvedSignature: "Best regards,\nAyush\nCS Student",
  };

  it("grounds generated drafts on verified products and hardware innovations", () => {
    const mockCompany = {
      id: "comp-1",
      name: "8BitDo",
      categories: ["Controllers"],
      facts: [
        {
          sourceUrl: "https://8bitdo.com",
          factsData: {
            keyProducts: ["Ultimate 2.4G Wireless Controller"],
            innovations: ["Hall Effect sensing joysticks"],
          },
          confidence: "VERIFIED",
          researchedAt: new Date(),
        },
      ],
    };

    const result = generateFactualDraft(mockCompany, mockUser);
    expect(result.subject).toContain("8BitDo Ultimate 2.4G Wireless Controller");
    expect(result.body).toContain("Ultimate 2.4G Wireless Controller");
    expect(result.body).toContain("hall effect sensing joysticks");
    expect(result.body).toContain("Ayush");
    expect(result.citedFacts.length).toBeGreaterThan(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("falls back gracefully when company has no sourced research facts", () => {
    const mockCompanyNoFacts = {
      id: "comp-2",
      name: "GenericGear",
      categories: ["Gamepads"],
      facts: [],
    };

    const result = generateFactualDraft(mockCompanyNoFacts, mockUser);
    expect(result.subject).toContain("GenericGear");
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("detects and flags deceptive or exaggerated claims in body text", () => {
    const deceptiveBody = "Hello, I have millions of followers and can guarantee a 5-star review!";
    const check = verifyDraftClaims(deceptiveBody, [], "8BitDo");
    expect(check.isClean).toBe(false);
    expect(check.warnings.some((w) => w.includes("audience size"))).toBe(true);
    expect(check.warnings.some((w) => w.includes("guaranteed positive review"))).toBe(true);
  });
});
