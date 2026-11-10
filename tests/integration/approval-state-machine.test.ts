import { describe, it, expect, beforeAll, afterAll } from "vitest";
import db from "@/lib/db";
import { sendApprovedDraft } from "@/lib/email/service";

describe("Approval State Machine, Invalidation & Sending Safeguards", () => {
  let testCompany: any;
  let testContact: any;
  let testDraft: any;

  beforeAll(async () => {
    // Clean up previous test entities if any
    await db.emailMessage.deleteMany({ where: { recipient: { contains: "test-pipeline" } } });
    await db.emailDraft.deleteMany({ where: { subject: { contains: "Test Pipeline" } } });
    await db.contact.deleteMany({ where: { email: { contains: "test-pipeline" } } });
    await db.company.deleteMany({ where: { normalizedName: "testpipelinetech" } });

    // Create test company
    testCompany = await db.company.create({
      data: {
        name: "Test Pipeline Tech",
        normalizedName: "testpipelinetech",
        website: "https://testpipelinetech.com",
        normalizedDomain: "testpipelinetech.com",
        categories: JSON.stringify(["Controllers"]),
      },
    });

    // Create test contact
    testContact = await db.contact.create({
      data: {
        companyId: testCompany.id,
        email: "pr@test-pipeline-tech.com",
        normalizedEmail: "pr@test-pipeline-tech.com",
        contactType: "PR",
        verificationStatus: "VERIFIED",
      },
    });

    // Create test draft in NEEDS_REVIEW
    testDraft = await db.emailDraft.create({
      data: {
        companyId: testCompany.id,
        contactId: testContact.id,
        subject: "Test Pipeline Inquiry",
        body: "Hello, this is a test sampling inquiry.",
        status: "NEEDS_REVIEW",
        version: 1,
      },
    });
  });

  afterAll(async () => {
    // Cleanup
    await db.emailMessage.deleteMany({ where: { draftId: testDraft?.id } });
    await db.emailDraft.deleteMany({ where: { companyId: testCompany?.id } });
    await db.contact.deleteMany({ where: { companyId: testCompany?.id } });
    await db.company.deleteMany({ where: { id: testCompany?.id } });
    await db.suppression.deleteMany({ where: { normalizedEmail: "pr@test-pipeline-tech.com" } });
  });

  it("blocks sending when draft is in NEEDS_REVIEW status", async () => {
    const result = await sendApprovedDraft({ draftId: testDraft.id });
    expect(result.success).toBe(false);
    expect(result.message).toContain("Safety violation: Draft is currently \"NEEDS_REVIEW\"");
  });

  it("blocks sending when draft was edited after approval (version mismatch)", async () => {
    // Set approvedVersion to 1, but increment version to 2 (simulating an edit)
    await db.emailDraft.update({
      where: { id: testDraft.id },
      data: {
        status: "APPROVED",
        version: 2,
        approvedVersion: 1, // Prior version approved, but edited to v2
      },
    });

    const result = await sendApprovedDraft({ draftId: testDraft.id });
    expect(result.success).toBe(false);
    expect(result.message).toContain("Safety violation: Draft version (2) does not match approved version (1)");
  });

  it("blocks sending when recipient is on the suppression list", async () => {
    // Add to suppression
    await db.suppression.create({
      data: {
        normalizedEmail: "pr@test-pipeline-tech.com",
        reason: "Test opt-out",
      },
    });

    // Valid approval on draft
    await db.emailDraft.update({
      where: { id: testDraft.id },
      data: {
        status: "APPROVED",
        version: 3,
        approvedVersion: 3,
      },
    });

    const result = await sendApprovedDraft({ draftId: testDraft.id });
    expect(result.success).toBe(false);
    expect(result.message).toContain("Delivery blocked: Recipient or domain is on the suppression list");

    // Remove suppression for subsequent tests
    await db.suppression.deleteMany({ where: { normalizedEmail: "pr@test-pipeline-tech.com" } });
  });

  it("successfully sends when draft is legitimately approved and passes all safeguards", async () => {
    const idempotencyKey = `test-send-${Date.now()}`;
    const result = await sendApprovedDraft({
      draftId: testDraft.id,
      idempotencyKey,
    });

    expect(result.success).toBe(true);
    expect(result.result?.status).toBe("SENT");
    expect(result.result?.provider).toBe("MOCK");

    // Verify draft status transitioned to SENT
    const updated = await db.emailDraft.findUnique({ where: { id: testDraft.id } });
    expect(updated?.status).toBe("SENT");

    // Verify EmailMessage record was created
    const message = await db.emailMessage.findUnique({ where: { idempotencyKey } });
    expect(message).not.toBeNull();
    expect(message?.recipient).toBe("pr@test-pipeline-tech.com");
  });

  it("blocks duplicate send attempts with identical idempotency key or prior recipient send", async () => {
    const duplicateAttempt = await sendApprovedDraft({ draftId: testDraft.id });
    expect(duplicateAttempt.success).toBe(false);
  });
});
