import "server-only";

import { prisma } from "@/lib/prisma";

// ─── Event categories ────────────────────────────────────────────────────────

export type TimelineCategory =
  | "lifecycle"
  | "assignment"
  | "return"
  | "repair"
  | "request"
  | "reimbursement"
  | "location";

// ─── Unified event shape ─────────────────────────────────────────────────────

export interface TimelineEvent {
  /** Stable sort key: ISO timestamp string. */
  timestamp: string;
  category: TimelineCategory;
  title: string;
  detail: string | null;
  actorName: string | null;
  /** Secondary label: employee name when relevant. */
  subjectName: string | null;
}

// ─── Audit-action → category / title mapping ────────────────────────────────
// Only map actions that are meaningful in the asset context.
// Unknown actions are skipped.

interface AuditMapping {
  category: TimelineCategory;
  title: string;
  /** If true, skip: this event is already covered by a relational record. */
  skipIfRelational?: boolean;
}

const AUDIT_MAP: Record<string, AuditMapping> = {
  ASSET_CREATED:          { category: "lifecycle",      title: "Asset created" },
  ASSET_UPDATED:          { category: "lifecycle",      title: "Asset details updated" },
  ASSET_RETIRED:          { category: "lifecycle",      title: "Asset retired" },
  ASSET_STATUS_CHANGED:   { category: "lifecycle",      title: "Asset status changed",       skipIfRelational: true },
  ASSET_ASSIGNED:         { category: "assignment",     title: "Asset assigned",             skipIfRelational: true },
  ASSET_LOCATION_SET:     { category: "location",       title: "Location set" },
  ASSET_LOCATION_UPDATED: { category: "location",       title: "Location updated" },
  ASSET_LOCATION_REMOVED: { category: "location",       title: "Location removed" },
  RETURN_REQUEST_CREATED: { category: "return",         title: "Return requested",           skipIfRelational: true },
  RETURN_REQUEST_APPROVED:{ category: "return",         title: "Return approved",            skipIfRelational: true },
  RETURN_REQUEST_REJECTED:{ category: "return",         title: "Return rejected",            skipIfRelational: true },
  MAINTENANCE_RECORD_CREATED: { category: "repair",     title: "Repair record started",      skipIfRelational: true },
  MAINTENANCE_RECORD_UPDATED: { category: "repair",     title: "Repair record updated" },
  MAINTENANCE_COMPLETED:  { category: "repair",         title: "Repair completed",           skipIfRelational: true },
  REIMBURSEMENT_SUBMITTED:{ category: "reimbursement",  title: "Reimbursement submitted",    skipIfRelational: true },
  REIMBURSEMENT_APPROVED: { category: "reimbursement",  title: "Reimbursement approved",     skipIfRelational: true },
  REIMBURSEMENT_REJECTED: { category: "reimbursement",  title: "Reimbursement rejected",     skipIfRelational: true },
  REIMBURSEMENT_CANCELLED:{ category: "reimbursement",  title: "Reimbursement cancelled",    skipIfRelational: true },
};

// ─── Admin timeline (full history) ──────────────────────────────────────────

export async function getAssetTimeline(assetId: string): Promise<TimelineEvent[]> {
  // Single batched fetch — one query per model, all scoped to this asset.
  const [asset, assignments, returnRequests, maintenance, assetRequests, reimbursements, auditLogs] =
    await Promise.all([
      prisma.asset.findUnique({
        where: { id: assetId },
        select: { createdAt: true, updatedAt: true },
      }),
      prisma.assetAssignment.findMany({
        where: { assetId },
        orderBy: { assignedAt: "asc" },
        include: { employee: { select: { name: true } } },
      }),
      prisma.returnRequest.findMany({
        where: { assetId },
        orderBy: { requestedAt: "asc" },
        include: {
          employee: { select: { name: true } },
          reviewedBy: { select: { name: true } },
        },
      }),
      prisma.maintenanceRecord.findMany({
        where: { assetId },
        orderBy: { startedAt: "asc" },
      }),
      prisma.assetRequest.findMany({
        where: { assetId },
        orderBy: { requestedAt: "asc" },
        include: {
          employee: { select: { name: true } },
          reviewedBy: { select: { name: true } },
        },
      }),
      prisma.reimbursement.findMany({
        where: { assetId },
        orderBy: { submittedAt: "asc" },
        include: {
          employee: { select: { name: true } },
          reviewedBy: { select: { name: true } },
        },
      }),
      prisma.auditLog.findMany({
        where: { entityType: "Asset", entityId: assetId },
        orderBy: { createdAt: "asc" },
        include: { actor: { select: { name: true } } },
      }),
    ]);

  if (!asset) return [];

  const events: TimelineEvent[] = [];

  // ── Relational events (source-of-truth, no duplication from audit) ─────────

  // Assignments
  for (const a of assignments) {
    events.push({
      timestamp: a.assignedAt.toISOString(),
      category: "assignment",
      title: "Asset assigned",
      detail: null,
      actorName: null,
      subjectName: a.employee.name,
    });
    if (a.returnedAt) {
      events.push({
        timestamp: a.returnedAt.toISOString(),
        category: "assignment",
        title: "Asset returned",
        detail: null,
        actorName: null,
        subjectName: a.employee.name,
      });
    }
  }

  // Return requests
  for (const r of returnRequests) {
    events.push({
      timestamp: r.requestedAt.toISOString(),
      category: "return",
      title: "Return requested",
      detail: r.reason.length > 120 ? r.reason.slice(0, 120) + "…" : r.reason,
      actorName: null,
      subjectName: r.employee.name,
    });
    if (r.reviewedAt) {
      events.push({
        timestamp: r.reviewedAt.toISOString(),
        category: "return",
        title: r.status === "APPROVED" ? "Return approved" : "Return rejected",
        detail: null,
        actorName: r.reviewedBy?.name ?? null,
        subjectName: r.employee.name,
      });
    }
  }

  // Maintenance records
  for (const m of maintenance) {
    events.push({
      timestamp: m.startedAt.toISOString(),
      category: "repair",
      title: "Repair started",
      detail: m.issue.length > 120 ? m.issue.slice(0, 120) + "…" : m.issue,
      actorName: null,
      subjectName: m.vendor ?? null,
    });
    if (m.completedAt) {
      events.push({
        timestamp: m.completedAt.toISOString(),
        category: "repair",
        title: "Repair completed",
        detail: m.resolution
          ? m.resolution.length > 120
            ? m.resolution.slice(0, 120) + "…"
            : m.resolution
          : null,
        actorName: null,
        subjectName: m.vendor ?? null,
      });
    }
  }

  // Asset requests
  for (const ar of assetRequests) {
    events.push({
      timestamp: ar.requestedAt.toISOString(),
      category: "request",
      title: "Asset requested",
      detail: ar.reason ?? null,
      actorName: null,
      subjectName: ar.employee.name,
    });
    if (ar.reviewedAt) {
      const statusLabel =
        ar.status === "APPROVED" ? "approved"
        : ar.status === "REJECTED" ? "rejected"
        : "cancelled";
      events.push({
        timestamp: ar.reviewedAt.toISOString(),
        category: "request",
        title: `Request ${statusLabel}`,
        detail: ar.reviewNote ?? null,
        actorName: ar.reviewedBy?.name ?? null,
        subjectName: ar.employee.name,
      });
    }
  }

  // Reimbursements
  for (const rb of reimbursements) {
    events.push({
      timestamp: rb.submittedAt.toISOString(),
      category: "reimbursement",
      title: "Reimbursement submitted",
      detail: `${rb.description} — ${Number(rb.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      actorName: null,
      subjectName: rb.employee.name,
    });
    if (rb.reviewedAt) {
      const statusLabel = rb.status === "APPROVED" ? "approved" : rb.status === "REJECTED" ? "rejected" : "cancelled";
      events.push({
        timestamp: rb.reviewedAt.toISOString(),
        category: "reimbursement",
        title: `Reimbursement ${statusLabel}`,
        detail: rb.rejectionReason ?? null,
        actorName: rb.reviewedBy?.name ?? null,
        subjectName: rb.employee.name,
      });
    }
  }

  // ── AuditLog events — only those NOT already covered by relational data ────
  // We include: ASSET_CREATED, ASSET_UPDATED, ASSET_RETIRED,
  // ASSET_LOCATION_*, MAINTENANCE_RECORD_UPDATED.
  // We skip anything with skipIfRelational=true since those are emitted above.

  for (const log of auditLogs) {
    const mapping = AUDIT_MAP[log.action];
    if (!mapping) continue;
    if (mapping.skipIfRelational) continue;

    // For ASSET_STATUS_CHANGED we skip — covered by assignment/return/repair relational events.
    // For ASSET_UPDATED, only emit if it's not just the status field changing.
    const meta = log.metadata as Record<string, unknown> | null;

    let detail: string | null = null;
    if (log.action === "ASSET_LOCATION_SET" || log.action === "ASSET_LOCATION_UPDATED") {
      const lt = meta?.locationType as string | undefined;
      detail = lt ? `Type: ${lt}` : null;
    }
    if (log.action === "ASSET_RETIRED") {
      const prev = meta?.previousStatus as string | undefined;
      detail = prev ? `Was: ${prev}` : null;
    }

    events.push({
      timestamp: log.createdAt.toISOString(),
      category: mapping.category,
      title: mapping.title,
      detail,
      actorName: log.actor?.name ?? null,
      subjectName: null,
    });
  }

  // ── Sort descending (newest first) ────────────────────────────────────────
  events.sort((a, b) => {
    const diff = b.timestamp.localeCompare(a.timestamp);
    if (diff !== 0) return diff;
    // Tiebreak: lifecycle events first so "created" appears above same-second events.
    const catOrder: Record<TimelineCategory, number> = {
      lifecycle: 0, assignment: 1, return: 2, repair: 3,
      request: 4, reimbursement: 5, location: 6,
    };
    return catOrder[a.category] - catOrder[b.category];
  });

  return events;
}

// ─── Employee timeline (filtered to their own custody/involvement) ────────────

export async function getAssetTimelineForEmployee(
  assetId: string,
  userId: string,
): Promise<TimelineEvent[]> {
  const employee = await prisma.employee.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!employee) return [];

  // Verify the employee has any historical relationship with the asset.
  const hasAccess = await prisma.assetAssignment.findFirst({
    where: { assetId, employeeId: employee.id },
    select: { id: true },
  });
  if (!hasAccess) return [];

  const all = await getAssetTimeline(assetId);

  // Filter: employees see assignment/return/repair/location/lifecycle events,
  // but only reimbursement/request events that belong to them.
  return all.filter((e) => {
    if (e.category === "reimbursement" || e.category === "request") {
      // Only show their own: subjectName will be their employee name.
      // We use the employee record's name as the filter key.
      // This is safe because subjectName comes from our server-side data layer,
      // not from the client.
      return false; // Hide requests/reimbursements from employee timeline entirely
                    // (they see those on /reimbursements and /my-assets already).
    }
    // Hide actor names from employees (internal admin info).
    return true;
  }).map((e) => ({
    ...e,
    // Scrub actor info before sending to employee view.
    actorName: null,
  }));
}
