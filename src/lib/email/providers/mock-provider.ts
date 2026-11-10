import { EmailProvider, SendEmailPayload, SendEmailResult } from "../types";
import crypto from "crypto";

export class MockEmailProvider implements EmailProvider {
  name: "MOCK" = "MOCK";

  async testConnection(): Promise<{ connected: boolean; message: string }> {
    return {
      connected: true,
      message: "Mock Email Provider is ready. Safe simulated delivery active (no real emails will be sent).",
    };
  }

  async sendApprovedMessage(payload: SendEmailPayload): Promise<SendEmailResult> {
    // Simulate slight network roundtrip
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Simulate occasional delivery unknown if testing error states
    if (payload.recipient.includes("fail-test@")) {
      return {
        success: false,
        provider: "MOCK",
        status: "FAILED",
        error: "Simulated provider failure: Mailbox does not exist.",
      };
    }

    if (payload.recipient.includes("timeout-test@")) {
      return {
        success: false,
        provider: "MOCK",
        status: "DELIVERY_UNKNOWN",
        error: "Simulated gateway timeout. Ambiguous delivery status.",
      };
    }

    const providerMessageId = `mock-msg-${crypto.randomUUID()}`;

    return {
      success: true,
      provider: "MOCK",
      providerMessageId,
      sentAt: new Date(),
      status: "SENT",
    };
  }
}
