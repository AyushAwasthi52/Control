import { EmailProvider, SendEmailPayload, SendEmailResult } from "../types";
import db from "@/lib/db";
import { decryptSecret, encryptSecret } from "@/lib/security/encryption";
import nodemailer from "nodemailer";
import { getFreshEnv } from "@/lib/config/env";

export class GmailEmailProvider implements EmailProvider {
  name: "GMAIL" = "GMAIL";

  /**
   * Retrieves active Gmail credentials from database or environment variables.
   * Supports both App Password (SMTP) and OAuth 2.0.
   */
  async getCredentials(): Promise<{
    type: "SMTP_APP_PASSWORD" | "OAUTH2";
    email: string;
    appPassword?: string;
    oauthTokens?: { access_token: string; refresh_token?: string };
  } | null> {
    // 1. Check IntegrationAccount in database
    const dbAccount = await db.integrationAccount.findFirst({
      where: { provider: "GMAIL", status: "ACTIVE" },
    });

    if (dbAccount) {
      try {
        const decrypted = decryptSecret(dbAccount.encryptedToken);
        const parsed = JSON.parse(decrypted);
        if (parsed.type === "SMTP_APP_PASSWORD") {
          return {
            type: "SMTP_APP_PASSWORD",
            email: dbAccount.accountEmail,
            appPassword: parsed.appPassword,
          };
        } else {
          return {
            type: "OAUTH2",
            email: dbAccount.accountEmail,
            oauthTokens: parsed,
          };
        }
      } catch (e) {
        console.error("Failed to decrypt integration account token:", e);
      }
    }

    // 2. Check fresh environment variables (with fallback to .env on disk)
    const freshEnv = getFreshEnv();
    const envUser = (freshEnv.GMAIL_USER || process.env.GMAIL_USER)?.trim();
    const envAppPass = (freshEnv.GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD)?.trim().replace(/\s+/g, "");

    if (envUser && envAppPass) {
      // Sync to database if not already present
      if (!dbAccount) {
        try {
          const encryptedPayload = encryptSecret(
            JSON.stringify({
              type: "SMTP_APP_PASSWORD",
              appPassword: envAppPass,
            })
          );
          await db.integrationAccount.upsert({
            where: { id: "gmail-env-account" },
            update: {
              accountEmail: envUser,
              encryptedToken: encryptedPayload,
              status: "ACTIVE",
            },
            create: {
              id: "gmail-env-account",
              provider: "GMAIL",
              accountEmail: envUser,
              scopes: "smtp:send",
              encryptedToken: encryptedPayload,
              status: "ACTIVE",
            },
          });
        } catch {
          // Non-critical if DB sync fails
        }
      }

      return {
        type: "SMTP_APP_PASSWORD",
        email: envUser,
        appPassword: envAppPass,
      };
    }

    return null;
  }

  async testConnection(): Promise<{ connected: boolean; message: string }> {
    const creds = await this.getCredentials();

    if (!creds) {
      return {
        connected: false,
        message:
          "Gmail is not configured. Provide GMAIL_USER and GMAIL_APP_PASSWORD in .env or configure in Integrations.",
      };
    }

    if (creds.type === "SMTP_APP_PASSWORD" && creds.appPassword) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: creds.email,
            pass: creds.appPassword,
          },
        });

        await transporter.verify();
        return {
          connected: true,
          message: `Live Gmail connection verified via SMTP for ${creds.email}. Ready for real delivery.`,
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "SMTP verification failed";
        return {
          connected: false,
          message: `Gmail SMTP verification failed for ${creds.email}: ${msg}. Ensure 2-Step Verification is on and use a 16-character App Password from Google Account.`,
        };
      }
    }

    if (creds.type === "OAUTH2" && creds.oauthTokens) {
      return {
        connected: true,
        message: `Connected to Gmail OAuth account: ${creds.email}`,
      };
    }

    return {
      connected: false,
      message: "Unrecognized Gmail credentials format.",
    };
  }

  async sendApprovedMessage(payload: SendEmailPayload): Promise<SendEmailResult> {
    const creds = await this.getCredentials();

    if (!creds) {
      return {
        success: false,
        provider: "GMAIL",
        status: "FAILED",
        error:
          "Gmail delivery is active but credentials are missing. Configure GMAIL_USER & GMAIL_APP_PASSWORD or connect OAuth.",
      };
    }

    // Option A: Send via Gmail SMTP (App Password)
    if (creds.type === "SMTP_APP_PASSWORD" && creds.appPassword) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: creds.email,
            pass: creds.appPassword,
          },
        });

        const info = await transporter.sendMail({
          from: `"Ayush" <${creds.email}>`,
          to: payload.recipient,
          subject: payload.subject,
          text: payload.body,
        });

        return {
          success: true,
          provider: "GMAIL",
          providerMessageId: info.messageId,
          sentAt: new Date(),
          status: "SENT",
        };
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Error sending email via Gmail SMTP";
        return {
          success: false,
          provider: "GMAIL",
          status: "FAILED",
          error: errorMsg,
        };
      }
    }

    // Option B: Send via Gmail REST API (OAuth 2.0)
    if (creds.type === "OAUTH2" && creds.oauthTokens) {
      try {
        const utf8Subject = `=?utf-8?B?${Buffer.from(payload.subject).toString("base64")}?=`;
        const messageParts = [
          `From: <${creds.email}>`,
          `To: <${payload.recipient}>`,
          `Subject: ${utf8Subject}`,
          "Content-Type: text/plain; charset=utf-8",
          "MIME-Version: 1.0",
          "",
          payload.body,
        ];
        const message = messageParts.join("\r\n");
        const encodedMessage = Buffer.from(message)
          .toString("base64")
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");

        const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${creds.oauthTokens.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ raw: encodedMessage }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          return {
            success: false,
            provider: "GMAIL",
            status: "FAILED",
            error: `Gmail API error (${response.status}): ${errorData}`,
          };
        }

        const responseJson = await response.json();
        return {
          success: true,
          provider: "GMAIL",
          providerMessageId: responseJson.id,
          sentAt: new Date(),
          status: "SENT",
        };
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error sending via Gmail API";
        return {
          success: false,
          provider: "GMAIL",
          status: "FAILED",
          error: errorMsg,
        };
      }
    }

    return {
      success: false,
      provider: "GMAIL",
      status: "FAILED",
      error: "No compatible Gmail delivery method configured.",
    };
  }
}
