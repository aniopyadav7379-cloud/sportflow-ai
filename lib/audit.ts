import { prisma } from "@/lib/prisma";

export async function logAudit(opts: {
  userId?: string | null;
  action: "CREATE" | "UPDATE" | "DELETE";
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: opts.userId ?? undefined,
        action: opts.action,
        entity: opts.entity,
        entityId: opts.entityId,
        metadata: opts.metadata ? JSON.stringify(opts.metadata) : undefined,
      },
    });
  } catch (err) {
    // Audit logging must never break the primary request.
    console.error("Audit log failed:", err);
  }
}
