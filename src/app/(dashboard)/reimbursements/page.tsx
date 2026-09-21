import { Receipt } from "lucide-react";

import { CancelReimbursementButton } from "@/components/reimbursements/cancel-reimbursement-button";
import { ReimbursementsTable } from "@/components/reimbursements/reimbursements-table";
import { SubmitReimbursementDialog } from "@/components/reimbursements/submit-reimbursement-dialog";
import { ActivityRow } from "@/components/dashboard/activity-row";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { ReimbursementStatusBadge } from "@/components/shared/status-badge";
import { requireAuth } from "@/lib/auth-guards";
import {
  getReimbursements,
  getMyReimbursements,
  getReimbursableAssets,
} from "@/lib/data/reimbursements";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function ReimbursementsPage() {
  const session = await requireAuth();
  const isAdmin =
    session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";

  // ── Admin view ─────────────────────────────────────────────────────────────
  if (isAdmin) {
    const requests = await getReimbursements();

    return (
      <div className="space-y-6">
        <PageHeader
          title="Reimbursement Requests"
          description="Review and action employee repair reimbursement requests."
        />
        {requests.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No reimbursement requests"
            description="Employee reimbursement requests will appear here for review."
          />
        ) : (
          <ReimbursementsTable requests={requests} />
        )}
      </div>
    );
  }

  // ── Employee view ──────────────────────────────────────────────────────────
  const myRequests = await getMyReimbursements(session.user.id);
  const assets = await getReimbursableAssets(session.user.id);

  // Load all maintenance records for eligible assets in one query.
  const assetIds = assets.map((a) => a.id);
  const allMaintenanceRecords =
    assetIds.length > 0
      ? await prisma.maintenanceRecord.findMany({
          where: { assetId: { in: assetIds } },
          orderBy: { startedAt: "desc" },
          select: {
            id: true,
            assetId: true,
            issue: true,
            startedAt: true,
            completedAt: true,
          },
        })
      : [];

  const pending = myRequests.filter((r) => r.status === "PENDING");
  const past = myRequests.filter((r) => r.status !== "PENDING");

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Reimbursements"
        description="Submit and track your repair reimbursement requests."
        actions={
          assets.length > 0 ? (
            <SubmitReimbursementDialog
              assets={assets}
              maintenanceRecords={allMaintenanceRecords.map((r) => ({
                ...r,
                startedAt: r.startedAt.toISOString(),
                completedAt: r.completedAt?.toISOString() ?? null,
              }))}
            />
          ) : null
        }
      />

      {/* ─── Pending ───────────────────────────────────────────── */}
      <DashboardSection
        title="Pending requests"
        description="Awaiting admin review."
      >
        {pending.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No pending requests"
            description={
              assets.length > 0
                ? "Submit a request for any out-of-pocket repair expense."
                : "You have no assets eligible for reimbursement."
            }
          />
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border bg-card">
            {pending.map((req) => (
              <div
                key={req.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{req.assetName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {req.assetTag}
                    {req.maintenanceIssue ? ` · ${req.maintenanceIssue}` : ""}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {req.description}
                    {req.receiptReference
                      ? ` · Ref: ${req.receiptReference}`
                      : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-medium">
                    {Number(req.amount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(req.submittedAt)}
                  </span>
                  <ReimbursementStatusBadge status={req.status} />
                  <CancelReimbursementButton reimbursementId={req.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardSection>

      {/* ─── History ───────────────────────────────────────────── */}
      {past.length > 0 ? (
        <DashboardSection
          title="Request history"
          description="Previously processed requests."
        >
          {past.map((req) => (
            <ActivityRow
              key={req.id}
              primary={`${req.assetName} — ${Number(req.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              secondary={
                req.rejectionReason
                  ? `Rejected: ${req.rejectionReason}`
                  : req.description
              }
              meta={formatDate(req.submittedAt)}
              badge={<ReimbursementStatusBadge status={req.status} />}
            />
          ))}
        </DashboardSection>
      ) : null}
    </div>
  );
}
