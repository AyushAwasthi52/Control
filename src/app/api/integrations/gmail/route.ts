import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getActiveEmailProvider } from "@/lib/email/service";
import { logActivity } from "@/lib/audit/logger";
import { encryptSecret } from "@/lib/security/encryption";
import nodemailer from "nodemailer";

import { getFreshEnv } from "@/lib/config/env";

export async function GET() {
  try {
    const freshEnv = getFreshEnv();
    const provider = await getActiveEmailProvider();
    const testResult = await provider.testConnection();

    const gmailAccount = await db.integrationAccount.findFirst({
      where: { provider: "GMAIL" },
    });

    const isEnvConfigured = !!(freshEnv.GMAIL_USER && freshEnv.GMAIL_APP_PASSWORD);

    return NextResponse.json({
      activeProvider: provider.name,
      configuredEnv: freshEnv.EMAIL_PROVIDER || (isEnvConfigured ? "gmail" : "mock"),
      testResult,
      gmailAccount: gmailAccount
        ? {
            id: gmailAccount.id,
            accountEmail: gmailAccount.accountEmail,
            scopes: gmailAccount.scopes,
            connectedAt: gmailAccount.connectedAt,
            status: gmailAccount.status,
          }
        : null,
      envConfigured: isEnvConfigured,
      configuredUser: freshEnv.GMAIL_USER || null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching integration status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // Action 1: Save Gmail App Password & Verify via SMTP
    if (action === "save_app_password") {
      const { email, appPassword } = body;
      if (!email || !appPassword) {
        return NextResponse.json(
          { error: "Both Gmail address and 16-character App Password are required." },
          { status: 400 }
        );
      }

      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = appPassword.trim().replace(/\s+/g, "");

      // Verify connection with Gmail SMTP
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: cleanEmail,
            pass: cleanPass,
          },
        });

        await transporter.verify();
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "SMTP verification failed";
        return NextResponse.json(
          {
            error: `Gmail verification failed: ${errorMsg}. Please ensure 2-Step Verification is active and you generated an App Password at myaccount.google.com/apppasswords.`,
          },
          { status: 401 }
        );
      }

      // Encrypt credentials at rest
      const encryptedPayload = encryptSecret(
        JSON.stringify({
          type: "SMTP_APP_PASSWORD",
          appPassword: cleanPass,
        })
      );

      // Upsert IntegrationAccount
      await db.integrationAccount.deleteMany({ where: { provider: "GMAIL" } });
      const account = await db.integrationAccount.create({
        data: {
          provider: "GMAIL",
          accountEmail: cleanEmail,
          scopes: "smtp:send",
          encryptedToken: encryptedPayload,
          status: "ACTIVE",
        },
      });

      await logActivity({
        action: "GMAIL_SMTP_CONNECTED",
        entityType: "INTEGRATION",
        entityId: account.id,
        metadata: { email: cleanEmail },
      });

      return NextResponse.json({
        success: true,
        message: `Gmail successfully verified and connected for ${cleanEmail}! Live sending is now active.`,
        account: {
          id: account.id,
          accountEmail: account.accountEmail,
          status: account.status,
        },
      });
    }

    // Action 2: Disconnect Gmail
    if (action === "disconnect") {
      await db.integrationAccount.deleteMany({
        where: { provider: "GMAIL" },
      });

      await logActivity({
        action: "GMAIL_DISCONNECTED",
        entityType: "INTEGRATION",
        entityId: "gmail",
      });

      return NextResponse.json({ success: true, message: "Gmail account disconnected." });
    }

    // Action 3: Test connection
    if (action === "test") {
      const provider = await getActiveEmailProvider(body.provider);
      const testResult = await provider.testConnection();
      return NextResponse.json({ testResult });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error processing integration action";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
