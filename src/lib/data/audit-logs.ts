import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

/**
 * Keys that must never surface in the UI even if a future action
 * accidentally logs them in `metadata`. Matched case-insensitively
 * against object keys, recursively.
 */
const SENSITIVE_KEY_PATTERN =
  /password|secret|token|credential|apikey|api_key|authorization/i;

export type AuditMetadata = Record<string, unknown> | null;

function sanitizeMetadata(value: Prisma.JsonValue | null): AuditMetadata {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const entries = Object.entries(value as Record<string, unknown>).map(
    ([key, val]) => {
      if (SENSITIVE_KEY_PATTERN.test(key)) {
        return [key, "[redacted]"] as const;
      }
      if (val && typeof val === "object") {
        // One level of recursion is enough for the shapes actually
        // written by recordAuditLog()/tx.auditLog.create() today,
        // while still guarding nested objects if they ever appear.
        const nested = Object.entries(val as Record<string, unknown>).map(
          ([nestedKey, nestedVal]) =>
            [
              nestedKey,
              SENSITIVE_KEY_PATTERN.test(nestedKey) ? "[redacted]" : nestedVal,
            ] as const
        );
        return [key, Object.fromEntries(nested)] as const;
      }
      return [key, val] as const;
    }
  );

  return Object.fromEntries(entries);
}

export const AUDIT_LOG_PAGE_SIZE = 25;

export interface AuditLogListFilters {
  /** Matches actor name or email, case-insensitive. */
  search?: string;
  action?: string;
  entityType?: string;
}

export interface AuditLogListItem {
  id: string;
  actorId: string | null;
  actorName: string | null;
  actorEmail: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata: AuditMetadata;
  createdAt: Date;
}

export interface AuditLogListResult {
  items: AuditLogListItem[];
  totalCount: number;
  page: number;
  pageCount: number;
  pageSize: number;
}

function buildWhere(filters: AuditLogListFilters): Prisma.AuditLogWhereInput {
  return {
    ...(filters.action ? { action: filters.action } : {}),
    ...(filters.entityType ? { entityType: filters.entityType } : {}),
    ...(filters.search
      ? {
          actor: {
            OR: [
              { name: { contains: filters.search, mode: "insensitive" } },
              { email: { contains: filters.search, mode: "insensitive" } },
            ],
          },
        }
      : {}),
  };
}

/**
 * Fetches one page of audit log records, newest first. Never loads
 * the full table — always bounded by AUDIT_LOG_PAGE_SIZE (or a
 * caller-supplied size) via `take`/`skip`.
 */
export async function getAuditLogs(
  filters: AuditLogListFilters = {},
  page = 1,
  pageSize: number = AUDIT_LOG_PAGE_SIZE
): Promise<AuditLogListResult> {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const where = buildWhere(filters);

  const totalCount = await prisma.auditLog.count({ where });
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  // Clamp so an out-of-range ?page= (too high, zero, negative, NaN)
  // can never turn into an invalid skip/empty-but-"page 47 of 3" UI.
  const clampedPage = Math.min(safePage, pageCount);

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (clampedPage - 1) * pageSize,
    take: pageSize,
    include: {
      actor: { select: { name: true, email: true } },
    },
  });

  return {
    items: logs.map((log) => ({
      id: log.id,
      actorId: log.actorId,
      actorName: log.actor?.name ?? null,
      actorEmail: log.actor?.email ?? null,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      metadata: sanitizeMetadata(log.metadata),
      createdAt: log.createdAt,
    })),
    totalCount,
    page: clampedPage,
    pageCount,
    pageSize,
  };
}

/** Distinct `action` values currently present, for the filter dropdown. */
export async function getAuditLogActions(): Promise<string[]> {
  const rows = await prisma.auditLog.findMany({
    distinct: ["action"],
    select: { action: true },
    orderBy: { action: "asc" },
  });
  return rows.map((r) => r.action);
}

/** Distinct `entityType` values currently present, for the filter dropdown. */
export async function getAuditLogEntityTypes(): Promise<string[]> {
  const rows = await prisma.auditLog.findMany({
    distinct: ["entityType"],
    select: { entityType: true },
    orderBy: { entityType: "asc" },
  });
  return rows.map((r) => r.entityType);
}
