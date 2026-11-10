import db from "@/lib/db";

export async function logActivity({
  actor = "user",
  action,
  entityType,
  entityId,
  metadata,
}: {
  actor?: string;
  action: string;
  entityType: "COMPANY" | "CONTACT" | "DRAFT" | "MESSAGE" | "SUPPRESSION" | "INTEGRATION" | "SYSTEM";
  entityId: string;
  metadata?: Record<string, unknown> | null;
}) {
  try {
    return await db.activityLog.create({
      data: {
        actor,
        action,
        entityType,
        entityId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    // Non-blocking log failure, report to console
    console.error("Failed to write to activity log:", error);
    return null;
  }
}
