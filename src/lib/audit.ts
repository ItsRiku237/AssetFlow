import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

interface RecordAuditLogInput {
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
}

export async function recordAuditLog({
  actorId,
  action,
  entityType,
  entityId,
  metadata,
}: RecordAuditLogInput) {
  await prisma.auditLog.create({
    data: { actorId, action, entityType, entityId, metadata },
  });
}
