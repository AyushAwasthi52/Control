import db from "@/lib/db";

export interface AnalyticsSummary {
  counts: {
    totalCompanies: number;
    nonArchivedCompanies: number;
    researchedCompanies: number;
    companiesWithVerifiedContact: number;
    totalContacts: number;
    verifiedContacts: number;
    totalDrafts: number;
    approvedDrafts: number;
    needsReviewDrafts: number;
    totalSentMessages: number;
    mockSentMessages: number;
    gmailSentMessages: number;
    failedMessages: number;
    totalReplies: number;
    positiveReplies: number;
    confirmedOffers: number;
    productsReceived: number;
    suppressedCount: number;
  };
  rates: {
    researchCoverage: number; // researched / non-archived
    contactCoverage: number;  // with verified contact / researched
    draftReadiness: number;   // approved drafts / total drafts
    replyRate: number;        // total replies / sent messages
    positiveReplyRate: number;// positive replies / sent messages
    offerConversionRate: number;// confirmed offers / sent messages
  };
  funnel: Array<{
    step: string;
    count: number;
    description: string;
  }>;
}

export async function calculateAnalytics(): Promise<AnalyticsSummary> {
  // 1. Companies metrics
  const totalCompanies = await db.company.count();
  const nonArchivedCompanies = await db.company.count({
    where: { status: { not: "ARCHIVED" } },
  });

  const companiesWithResearch = await db.company.count({
    where: {
      status: { not: "ARCHIVED" },
      researchRecords: { some: {} },
    },
  });

  // 2. Contacts metrics
  const totalContacts = await db.contact.count();
  const verifiedContacts = await db.contact.count({
    where: { verificationStatus: "VERIFIED" },
  });

  const companiesWithVerifiedContact = await db.company.count({
    where: {
      status: { not: "ARCHIVED" },
      researchRecords: { some: {} },
      contacts: {
        some: {
          verificationStatus: "VERIFIED",
        },
      },
    },
  });

  // 3. Drafts metrics
  const totalDrafts = await db.emailDraft.count();
  const approvedDrafts = await db.emailDraft.count({
    where: { status: "APPROVED" },
  });
  const needsReviewDrafts = await db.emailDraft.count({
    where: { status: "NEEDS_REVIEW" },
  });

  // 4. Messages metrics
  const sentMessages = await db.emailMessage.findMany({
    where: { status: "SENT" },
  });
  const totalSentMessages = sentMessages.length;
  const mockSentMessages = sentMessages.filter((m) => m.provider === "MOCK").length;
  const gmailSentMessages = sentMessages.filter((m) => m.provider === "GMAIL").length;

  const failedMessages = await db.emailMessage.count({
    where: { status: { in: ["FAILED", "DELIVERY_UNKNOWN"] } },
  });

  // 5. Responses & Outcomes
  const responses = await db.response.findMany();
  const totalReplies = responses.length;
  const positiveReplies = responses.filter((r) =>
    ["INTERESTED", "SAMPLE_OFFERED", "PRODUCT_SHIPPED"].includes(r.responseType)
  ).length;
  const confirmedOffers = responses.filter((r) =>
    ["SAMPLE_OFFERED", "PRODUCT_SHIPPED"].includes(r.responseType)
  ).length;
  const productsReceived = responses.filter((r) =>
    r.responseType === "PRODUCT_SHIPPED"
  ).length;

  const suppressedCount = await db.suppression.count();

  // 6. Ratios with explicit non-zero denominators
  const researchCoverage =
    nonArchivedCompanies > 0 ? (companiesWithResearch / nonArchivedCompanies) * 100 : 0;

  const contactCoverage =
    companiesWithResearch > 0 ? (companiesWithVerifiedContact / companiesWithResearch) * 100 : 0;

  const draftReadiness =
    totalDrafts > 0 ? (approvedDrafts / totalDrafts) * 100 : 0;

  const replyRate =
    totalSentMessages > 0 ? (totalReplies / totalSentMessages) * 100 : 0;

  const positiveReplyRate =
    totalSentMessages > 0 ? (positiveReplies / totalSentMessages) * 100 : 0;

  const offerConversionRate =
    totalSentMessages > 0 ? (confirmedOffers / totalSentMessages) * 100 : 0;

  const funnel = [
    { step: "Identified Brands", count: nonArchivedCompanies, description: "Active peripheral companies discovered or imported" },
    { step: "Researched Leads", count: companiesWithResearch, description: "Brands with verified hardware & product evidence" },
    { step: "Verified Contacts", count: companiesWithVerifiedContact, description: "Brands with legitimate public business emails" },
    { step: "Drafts Approved", count: approvedDrafts, description: "Explicitly human-reviewed & approved outreach drafts" },
    { step: "Outreach Sent", count: totalSentMessages, description: "Confirmed sends (Mock + Gmail)" },
    { step: "Meaningful Replies", count: totalReplies, description: "Direct responses recorded from peripheral brands" },
    { step: "Confirmed Samples", count: confirmedOffers, description: "Offers extended for review or community testing" },
    { step: "Hardware Received", count: productsReceived, description: "Controllers or peripherals physically delivered" },
  ];

  return {
    counts: {
      totalCompanies,
      nonArchivedCompanies,
      researchedCompanies: companiesWithResearch,
      companiesWithVerifiedContact,
      totalContacts,
      verifiedContacts,
      totalDrafts,
      approvedDrafts,
      needsReviewDrafts,
      totalSentMessages,
      mockSentMessages,
      gmailSentMessages,
      failedMessages,
      totalReplies,
      positiveReplies,
      confirmedOffers,
      productsReceived,
      suppressedCount,
    },
    rates: {
      researchCoverage: Math.round(researchCoverage * 10) / 10,
      contactCoverage: Math.round(contactCoverage * 10) / 10,
      draftReadiness: Math.round(draftReadiness * 10) / 10,
      replyRate: Math.round(replyRate * 10) / 10,
      positiveReplyRate: Math.round(positiveReplyRate * 10) / 10,
      offerConversionRate: Math.round(offerConversionRate * 10) / 10,
    },
    funnel,
  };
}
