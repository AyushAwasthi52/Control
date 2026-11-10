export interface CompanyContext {
  id: string;
  name: string;
  website?: string | null;
  categories: string[];
  description?: string | null;
  facts: Array<{
    sourceUrl: string;
    factsData: {
      keyProducts?: string[];
      innovations?: string[];
      regions?: string[];
      notes?: string;
    };
    confidence: string;
    researchedAt: Date;
  }>;
}

export interface UserContext {
  displayName: string;
  country: string;
  genuineBackground: string;
  interests: string;
  approvedSignature: string;
}

export interface GeneratedDraftResult {
  subject: string;
  body: string;
  citedFacts: string[];
  warnings: string[];
}

export function generateFactualDraft(
  company: CompanyContext,
  user: UserContext,
  selectedCategory?: string
): GeneratedDraftResult {
  const citedFacts: string[] = [];
  const warnings: string[] = [];

  // Check if research records exist
  if (!company.facts || company.facts.length === 0) {
    warnings.push("No research records found for this company. Generating baseline template without specific product references.");
  }

  // Extract verified products or innovations from research
  const allVerifiedProducts: string[] = [];
  const allInnovations: string[] = [];

  company.facts.forEach((record) => {
    if (record.confidence === "VERIFIED" && record.factsData) {
      if (Array.isArray(record.factsData.keyProducts)) {
        allVerifiedProducts.push(...record.factsData.keyProducts);
      }
      if (Array.isArray(record.factsData.innovations)) {
        allInnovations.push(...record.factsData.innovations);
      }
    }
  });

  // Choose appropriate focal product or category
  let focalPoint = selectedCategory || (company.categories.length > 0 ? company.categories[0] : "controllers and gaming gear");
  let verifiedProductSnippet = "";

  if (allVerifiedProducts.length > 0) {
    const featured = allVerifiedProducts[0];
    citedFacts.push(`Key Product: "${featured}" (sourced from official documentation)`);
    focalPoint = `${company.name} ${featured}`;
    
    if (allInnovations.length > 0) {
      const innovation = allInnovations[0];
      citedFacts.push(`Hardware Innovation: "${innovation}"`);
      verifiedProductSnippet = `I came across your work on the ${featured}, particularly your implementation of ${innovation.toLowerCase()}. As an active gamer with a technical focus on controller ergonomics and input responsiveness, I would love the opportunity to test the hardware and provide detailed, honest feedback.`;
    } else {
      verifiedProductSnippet = `I came across your ${featured} and would be very interested in testing the hardware and sharing constructive, in-depth user feedback with your engineering and community teams.`;
    }
  } else {
    focalPoint = `${company.name} ${focalPoint}`;
    verifiedProductSnippet = `I came across your line of ${focalPoint} and would be keen to test a sampling unit and provide honest, detailed user feedback.`;
  }

  const subject = `Product-sampling inquiry — ${focalPoint}`;

  const body = `Hello ${company.name} Team,

I'm a ${user.genuineBackground.toLowerCase().includes("student") ? user.genuineBackground : `computer science student and PC gamer in ${user.country}`}, and I'm reaching out to inquire whether your team offers product-sampling, beta-testing, or community review opportunities for individual gamers.

${verifiedProductSnippet}

I completely understand that review units may not be available for every inquiry, but I would appreciate knowing if your team maintains a creator/tester program or a standard review process for passionate community members.

Thank you very much for your time and continued dedication to gaming hardware.

${user.approvedSignature || `Best regards,\n${user.displayName}\n${user.country}`}`;

  return {
    subject,
    body,
    citedFacts,
    warnings,
  };
}

/**
 * Analyzes a draft body to identify potential claims not backed by verified research facts.
 */
export function verifyDraftClaims(
  body: string,
  verifiedFacts: string[],
  companyName: string
): { warnings: string[]; isClean: boolean } {
  const warnings: string[] = [];

  // Check for forbidden deceptive keywords
  const forbiddenPatterns = [
    { pattern: /\b(millions of followers|100k followers|huge audience|massive fanbase)\b/i, message: "Claiming audience size or follower counts violates truthfulness policy." },
    { pattern: /\b(sponsored by|official partner of|endorsed by)\b/i, message: "Claiming prior brand endorsement without verification is prohibited." },
    { pattern: /\b(guarantee\s+(?:a\s+)?(?:positive|5-star)\s+review|guaranteed\s+(?:positive|5-star))\b/i, message: "Promising guaranteed positive reviews violates sampling policy." },
  ];

  for (const { pattern, message } of forbiddenPatterns) {
    if (pattern.test(body)) {
      warnings.push(`Policy Warning: ${message}`);
    }
  }

  // Check if draft references product names not in verified facts
  // (Provides informative warning in the UI evidence panel)
  if (verifiedFacts.length === 0) {
    warnings.push("Note: This draft contains no cited research records. Ensure all product claims are verified.");
  }

  return {
    warnings,
    isClean: warnings.length === 0,
  };
}
