import db from "@/lib/db";
import { EmailProvider, SendEmailResult } from "./types";
import { MockEmailProvider } from "./providers/mock-provider";
import { GmailEmailProvider } from "./providers/gmail-provider";
import { normalizeDomain, normalizeEmail } from "@/lib/security/normalization";
import { logActivity } from "@/lib/audit/logger";
import { getFreshEnv } from "@/lib/config/env";
import { generateFactualDraft, CompanyContext, UserContext } from "@/lib/drafting/generator";

import { verifyEmailDomainMx } from "@/lib/security/dns-verify";

export async function getActiveEmailProvider(preferred?: string): Promise<EmailProvider> {
  if (preferred === "gmail") return new GmailEmailProvider();
  if (preferred === "mock") return new MockEmailProvider();

  // In test environments, always default to Mock provider to prevent unintended delivery
  if (process.env.NODE_ENV === "test") {
    return new MockEmailProvider();
  }

  // 1. Check database integration account
  const activeIntegration = await db.integrationAccount.findFirst({
    where: { provider: "GMAIL", status: "ACTIVE" },
  });

  // 2. Check fresh environment variables (with fallback to .env on disk)
  const freshEnv = getFreshEnv();
  const hasGmailCreds = !!(freshEnv.GMAIL_USER && freshEnv.GMAIL_APP_PASSWORD);
  const providerEnv = (freshEnv.EMAIL_PROVIDER || process.env.EMAIL_PROVIDER || "").toLowerCase();

  // If real Gmail credentials exist or provider is configured as gmail, default to real Gmail!
  if (hasGmailCreds || providerEnv === "gmail" || activeIntegration) {
    return new GmailEmailProvider();
  }

  return new MockEmailProvider();
}

export interface SendApprovedDraftOptions {
  draftId: string;
  idempotencyKey?: string;
  actor?: string;
  preferredProvider?: "mock" | "gmail";
  autoApprove?: boolean;
}

export async function sendApprovedDraft({
  draftId,
  idempotencyKey,
  actor = "user",
  preferredProvider,
  autoApprove = false, // When false, validates state machine; when true, auto-approves for autonomous flow
}: SendApprovedDraftOptions): Promise<{
  success: boolean;
  message?: string;
  emailMessageId?: string;
  result?: SendEmailResult;
}> {
  // 1. Fetch draft with contact and company
  const draft = await db.emailDraft.findUnique({
    where: { id: draftId },
    include: {
      contact: true,
      company: true,
    },
  });

  if (!draft) {
    return { success: false, message: "Draft not found." };
  }

  // 2. Autonomous Mode: Auto-approve draft if it is in review or newly generated
  if (draft.status !== "APPROVED") {
    if (autoApprove) {
      await db.emailDraft.update({
        where: { id: draft.id },
        data: {
          status: "APPROVED",
          approvedVersion: draft.version,
          approvedAt: new Date(),
        },
      });
      draft.status = "APPROVED";
      draft.approvedVersion = draft.version;

      await logActivity({
        actor,
        action: "DRAFT_AUTO_APPROVED",
        entityType: "DRAFT",
        entityId: draft.id,
        metadata: { version: draft.version, autonomousMode: true },
      });
    } else {
      return {
        success: false,
        message: `Safety violation: Draft is currently "${draft.status}". Enable auto-dispatch or approve draft first.`,
      };
    }
  }

  // 3. Version Invalidation Check
  if (!draft.approvedVersion || draft.approvedVersion !== draft.version) {
    if (autoApprove) {
      await db.emailDraft.update({
        where: { id: draft.id },
        data: { approvedVersion: draft.version },
      });
      draft.approvedVersion = draft.version;
    } else {
      return {
        success: false,
        message: `Safety violation: Draft version (${draft.version}) does not match approved version (${draft.approvedVersion}).`,
      };
    }
  }

  // 4. Contact and Recipient Validation
  const recipient = draft.contact.email;
  const normEmail = normalizeEmail(recipient);
  const normDomain = normalizeDomain(recipient.split("@")[1] || "");

  // 5. Suppression Check
  const suppression = await db.suppression.findFirst({
    where: {
      OR: [
        { normalizedEmail: normEmail },
        ...(normDomain ? [{ normalizedDomain: normDomain }] : []),
      ],
    },
  });

  if (suppression) {
    return {
      success: false,
      message: `Delivery blocked: Recipient or domain is on the suppression list (Reason: "${suppression.reason}").`,
    };
  }

  // 5.5 DNS MX Mail Exchange Verification (Prevents bounces to dead/misconfigured domains)
  const mxCheck = await verifyEmailDomainMx(recipient);
  if (!mxCheck.deliverable) {
    return {
      success: false,
      message: `Delivery blocked: Domain "${normDomain}" cannot receive mail (${mxCheck.reason || "no valid MX records"}).`,
    };
  }

  // 6. Duplicate Send & Idempotency Key Handling
  const finalIdempotencyKey = idempotencyKey || `send-${draft.id}-v${draft.version}`;

  const existingMessage = await db.emailMessage.findUnique({
    where: { idempotencyKey: finalIdempotencyKey },
  });

  if (existingMessage) {
    return {
      success: false,
      message: `Duplicate send blocked: A send attempt with idempotency key ${finalIdempotencyKey} has already occurred.`,
      emailMessageId: existingMessage.id,
    };
  }

  // Check if an email was already sent to this recipient
  const priorSend = await db.emailMessage.findFirst({
    where: {
      recipient: recipient,
      status: "SENT",
    },
  });

  if (priorSend) {
    return {
      success: false,
      message: `Duplicate outreach blocked: A message was already sent to "${recipient}" on ${priorSend.sentAt.toISOString().split("T")[0]}.`,
    };
  }

  // 7. Execute Send through Active Provider
  const provider = await getActiveEmailProvider(preferredProvider);
  const sendResult = await provider.sendApprovedMessage({
    draftId: draft.id,
    recipient,
    subject: draft.subject,
    body: draft.body,
    idempotencyKey: finalIdempotencyKey,
  });

  // 8. Record Message History
  const emailMessage = await db.emailMessage.create({
    data: {
      draftId: draft.id,
      provider: provider.name,
      providerMessageId: sendResult.providerMessageId || null,
      recipient,
      sentAt: sendResult.sentAt || new Date(),
      status: sendResult.status,
      errorCode: sendResult.error || null,
      idempotencyKey: finalIdempotencyKey,
    },
  });

  // 9. Update Draft Status
  if (sendResult.success) {
    await db.emailDraft.update({
      where: { id: draft.id },
      data: { status: "SENT" },
    });
  } else {
    await db.emailDraft.update({
      where: { id: draft.id },
      data: { status: "FAILED" },
    });
  }

  // 10. Audit Logging
  await logActivity({
    actor,
    action: sendResult.success ? "MESSAGE_SENT" : "MESSAGE_SEND_FAILED",
    entityType: "MESSAGE",
    entityId: emailMessage.id,
    metadata: {
      draftId: draft.id,
      recipient,
      provider: provider.name,
      status: sendResult.status,
      error: sendResult.error,
      autonomous: true,
    },
  });

  return {
    success: sendResult.success,
    message: sendResult.success
      ? `Email dispatched successfully via ${provider.name} to ${recipient}.`
      : `Email delivery failed: ${sendResult.error}`,
    emailMessageId: emailMessage.id,
    result: sendResult,
  };
}

/**
 * Autonomous Pipeline Dispatch:
 * Takes a company, generates fact-grounded personalized outreach,
 * and immediately dispatches it via real Gmail without manual approval steps.
 */
export async function autoDispatchCompanyOutreach({
  companyId,
  actor = "dashboard-auto",
  preferredProvider,
}: {
  companyId: string;
  actor?: string;
  preferredProvider?: "mock" | "gmail";
}): Promise<{
  success: boolean;
  message: string;
  recipient?: string;
  subject?: string;
  draftId?: string;
  emailMessageId?: string;
  result?: SendEmailResult;
}> {
  // 1. Fetch company with contact and research
  const company = await db.company.findUnique({
    where: { id: companyId },
    include: {
      contacts: true,
      researchRecords: { orderBy: { researchedAt: "desc" }, take: 1 },
      drafts: { orderBy: { generatedAt: "desc" }, take: 1 },
    },
  });

  if (!company) {
    return { success: false, message: `Company ID "${companyId}" not found.` };
  }

  const contact = company.contacts[0];
  if (!contact || !contact.email) {
    return {
      success: false,
      message: `No contact email found for ${company.name}. Please discover or add a contact first.`,
    };
  }

  // 2. Fetch UserProfile
  const profile = await db.userProfile.findFirst();
  const userContext: UserContext = {
    displayName: profile?.displayName || "Ayush",
    country: profile?.country || "India",
    genuineBackground:
      profile?.genuineBackground ||
      "Computer Science student and competitive PC gamer passionate about gaming peripherals and input latency.",
    interests: profile?.interests || "Controllers, Hall-effect joysticks, microswitch face buttons",
    approvedSignature:
      profile?.approvedSignature || "Best regards,\nAyush\nB.Tech Computer Science | Peripheral Testing Enthusiast\nIndia",
  };

  // 3. Find or generate draft
  let draft = company.drafts[0];

  // If no draft exists or previous was rejected/failed, generate a fresh grounded draft
  if (!draft || draft.status === "REJECTED" || draft.status === "FAILED") {
    let categories: string[] = [];
    try {
      categories = JSON.parse(company.categories);
    } catch {
      categories = [];
    }

    const companyContext: CompanyContext = {
      id: company.id,
      name: company.name,
      website: company.website,
      categories,
      description: company.description,
      facts: company.researchRecords.map((r) => {
        let parsed = {};
        try {
          parsed = JSON.parse(r.facts);
        } catch {}
        return {
          sourceUrl: r.sourceUrl,
          factsData: parsed,
          confidence: r.confidence,
          researchedAt: r.researchedAt,
        };
      }),
    };

    const generated = generateFactualDraft(companyContext, userContext);

    draft = await db.emailDraft.create({
      data: {
        companyId: company.id,
        contactId: contact.id,
        subject: generated.subject,
        body: generated.body,
        status: "APPROVED",
        version: 1,
        approvedVersion: 1,
        approvedAt: new Date(),
      },
    });

    await logActivity({
      actor,
      action: "DRAFT_GENERATED_AUTO",
      entityType: "DRAFT",
      entityId: draft.id,
      metadata: { companyId: company.id, recipient: contact.email },
    });
  }

  // If already sent, prevent duplicate sending
  if (draft.status === "SENT") {
    return {
      success: false,
      message: `Outreach has already been sent to ${company.name} (${contact.email}). Check Outbox logs.`,
      recipient: contact.email,
      draftId: draft.id,
    };
  }

  // 4. Send Draft Immediately via Active Provider
  const sendRes = await sendApprovedDraft({
    draftId: draft.id,
    actor,
    preferredProvider,
    autoApprove: true,
  });

  return {
    success: sendRes.success,
    message: sendRes.message || "Dispatch completed.",
    recipient: contact.email,
    subject: draft.subject,
    draftId: draft.id,
    emailMessageId: sendRes.emailMessageId,
    result: sendRes.result,
  };
}
