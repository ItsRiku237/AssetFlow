import Image from "next/image";
import { CheckCircle2, Clock, DollarSign, Receipt, XCircle } from "lucide-react";

import { CancelReimbursementButton } from "@/components/reimbursements/cancel-reimbursement-button";
import { ReimbursementsTable } from "@/components/reimbursements/reimbursements-table";
import { SubmitReimbursementDialog } from "@/components/reimbursements/submit-reimbursement-dialog";
import { ActivityRow } from "@/components/dashboard/activity-row";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { GlassCard } from "@/components/design-system/glass-card";
import { FadeIn } from "@/components/design-system/fade-in";
import { EmptyState } from "@/components/shared/empty-state";
import { ReimbursementStatusBadge } from "@/components/shared/status-badge";
import { requireAuth } from "@/lib/auth-guards";
import {
  getReimbursements,
  getMyReimbursements,
  getReimbursableAssets,
} from "@/lib/data/reimbursements";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

function formatAmount(amount: string): string {
  return Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function ReimbursementsPage() {
  const session = await requireAuth();
  const isAdmin =
    session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";

  // ── Admin view ─────────────────────────────────────────────────────────────
  if (isAdmin) {
    const requests = await getReimbursements();
    const pending = requests.filter((r) => r.status === "PENDING").length;
    const approved = requests.filter((r) => r.status === "APPROVED").length;
    const rejected = requests.filter((r) => r.status === "REJECTED").length;

    return (
      <div className="space-y-6">
        {/* ── Hero ──────────────────────────────────────────── */}
        <FadeIn>
          <GlassCard className="relative overflow-hidden">
            <div className="absolute inset-0">
              <Image
                src="/images/assets-hero.webp"
                alt=""
                fill
                className="object-cover opacity-10"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-transparent" />
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 size-52 rounded-full opacity-20 blur-[80px]"
              style={{ background: "radial-gradient(circle, var(--glow-purple), transparent 70%)" }}
            />
            <div className="relative flex flex-wrap items-center justify-between gap-4 px-6 py-5">
              <div className="flex items-center gap-3">
                <span className="glow-icon-chip flex size-11 items-center justify-center rounded-xl text-primary">
                  <Receipt className="size-5" />
                </span>
                <div>
                  <h1 className="text-lg font-semibold tracking-tight">
                    Reimbursement Requests
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Review and action employee repair reimbursement requests.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                  <Clock className="size-3" /> {pending} pending
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success">
                  <CheckCircle2 className="size-3" /> {approved} approved
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                  <XCircle className="size-3" /> {rejected} rejected
                </span>
              </div>
            </div>
          </GlassCard>
        </FadeIn>

        {/* ── Table ─────────────────────────────────────────── */}
        <FadeIn delay={60}>
          {requests.length === 0 ? (
            <GlassCard className="p-6">
              <EmptyState
                icon={Receipt}
                title="No reimbursement requests"
                description="Employee reimbursement requests will appear here for review."
              />
            </GlassCard>
          ) : (
            <GlassCard className="overflow-hidden p-0">
              <ReimbursementsTable requests={requests} />
            </GlassCard>
          )}
        </FadeIn>
      </div>
    );
  }

  // ── Employee view ──────────────────────────────────────────────────────────
  const myRequests = await getMyReimbursements(session.user.id);
  const assets = await getReimbursableAssets(session.user.id);

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
      {/* ── Employee Hero ──────────────────────────────────── */}
      <FadeIn>
        <GlassCard className="relative overflow-hidden px-6 py-5">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full opacity-20 blur-[70px]"
            style={{ background: "radial-gradient(circle, var(--glow-purple), transparent 70%)" }}
          />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="glow-icon-chip flex size-10 items-center justify-center rounded-xl text-primary">
                <Receipt className="size-5" />
              </span>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">My Reimbursements</h1>
                <p className="text-sm text-muted-foreground">
                  Submit and track your repair reimbursement requests.
                </p>
              </div>
            </div>
            {assets.length > 0 ? (
              <SubmitReimbursementDialog
                assets={assets}
                maintenanceRecords={allMaintenanceRecords.map((r) => ({
                  ...r,
                  startedAt: r.startedAt.toISOString(),
                  completedAt: r.completedAt?.toISOString() ?? null,
                }))}
              />
            ) : null}
          </div>
        </GlassCard>
      </FadeIn>

      {/* ─── Pending ───────────────────────────────────────── */}
      <FadeIn delay={60}>
        <GlassCard className="overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
            <span className="glow-icon-chip flex size-7 items-center justify-center rounded-lg text-warning">
              <Clock className="size-3.5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Pending Requests</p>
              <p className="text-xs text-muted-foreground">Awaiting admin review.</p>
            </div>
          </div>
          {pending.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Receipt}
                title="No pending requests"
                description={
                  assets.length > 0
                    ? "Submit a request for any out-of-pocket repair expense."
                    : "You have no assets eligible for reimbursement."
                }
              />
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {pending.map((req) => (
                <div
                  key={req.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 text-sm transition-colors hover:bg-primary/5 sm:px-5"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="glow-icon-chip flex size-8 shrink-0 items-center justify-center rounded-lg text-primary">
                      <DollarSign className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{req.assetName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {req.assetTag}
                        {req.maintenanceIssue ? ` · ${req.maintenanceIssue}` : ""}
                      </p>
                      {req.description ? (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground/70">
                          {req.description}
                          {req.receiptReference ? ` · Ref: ${req.receiptReference}` : ""}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2.5">
                    <span className="font-semibold tabular-nums">
                      {formatAmount(req.amount)}
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
        </GlassCard>
      </FadeIn>

      {/* ─── History ───────────────────────────────────────── */}
      {past.length > 0 ? (
        <FadeIn delay={120}>
          <DashboardSection
            title="Request History"
            description="Previously processed requests."
          >
            {past.map((req) => (
              <ActivityRow
                key={req.id}
                primary={`${req.assetName} — ${formatAmount(req.amount)}`}
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
        </FadeIn>
      ) : null}
    </div>
  );
}
