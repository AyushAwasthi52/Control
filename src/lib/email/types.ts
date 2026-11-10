export interface SendEmailPayload {
  draftId: string;
  recipient: string;
  subject: string;
  body: string;
  idempotencyKey: string;
}

export interface SendEmailResult {
  success: boolean;
  provider: "MOCK" | "GMAIL";
  providerMessageId?: string;
  sentAt?: Date;
  status: "SENT" | "FAILED" | "DELIVERY_UNKNOWN";
  error?: string;
}

export interface EmailProvider {
  name: "MOCK" | "GMAIL";
  sendApprovedMessage(payload: SendEmailPayload): Promise<SendEmailResult>;
  testConnection(): Promise<{ connected: boolean; message: string }>;
}
