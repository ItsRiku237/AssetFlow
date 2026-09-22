import Image from "next/image";
import { Undo2, Clock, CheckCircle2, XCircle } from "lucide-react";

import { GlassCard } from "@/components/design-system/glass-card";
import { FadeIn } from "@/components/design-system/fade-in";
import { ReturnRequestsTable } from "@/components/return-requests/return-requests-table";
import { EmptyState } from "@/components/shared/empty-state";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { ActivityRow } from "@/components/dashboard/activity-row";
import { ReturnRequestStatusBadge } from "@/components/shared/status-badge";
import { requireAuth } from "@/lib/auth-guards";
import {
  getReturnRequests,
  getMyReturnRequests,
} from "@/lib/data/return-requests";
import { formatDate } from "@/lib/utils";

export default async function ReturnRequestsPage() {
  const session = await requireAuth();
  const isAdmin =
    session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";

  if (isAdmin) {
    const requests = await getReturnRequests();
    const pending = requests.filter((r) => r.status === "PENDING").length;
    const approved = requests.filter((r) => r.status === "APPROVED").length;
    const rejected = requests.filter((r) => r.status === "REJECTED").length;

    return (
      <div className="data-page-with-controls has-sticky-filter space-y-5">
        <FadeIn>
          <GlassCard className="relative overflow-hidden">
            <div className="absolute inset-0">
              <Image
                src="/images/asset-detail-hero.webp"
                alt=""
                fill
                className="object-cover opacity-10"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/96 via-background/88 to-background/70" />
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 size-52 rounded-full opacity-20 blur-[80px]"
              style={{ background: "radial-gradient(circle, var(--glow-purple), transparent 70%)" }}
            />
            <div className="relative flex flex-wrap items-center justify-between gap-4 px-6 py-5">
              <div className="flex items-center gap-3">
                <span className="glow-icon-chip flex size-11 items-center justify-center rounded-xl text-primary">
                  <Undo2 className="size-5" />
                </span>
                <div>
                  <h1 className="text-lg font-semibold tracking-tight">Return Requests</h1>
                  <p className="text-sm text-muted-foreground">
                    Employee return requests awaiting review.
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

        {/* ── Sticky Control / Summary Bar ──────────────────────── */}
        <div className="sticky-control-bar">
          <GlassCard className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <p className="text-sm font-medium text-muted-foreground">
              Total Requests: <span className="font-semibold text-foreground">{requests.length}</span>
            </p>
            <div className="flex flex-wrap items-center gap-2">
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
          </GlassCard>
        </div>

        <FadeIn delay={60}>
          {requests.length === 0 ? (
            <EmptyState
              icon={Undo2}
              title="No return requests yet"
              description="Employee return requests will appear here."
            />
          ) : (
            <GlassCard className="overflow-visible rounded-xl p-0">
              <ReturnRequestsTable requests={requests} />
            </GlassCard>
          )}
        </FadeIn>
      </div>
    );
  }

  // ── Employee view ────────────────────────────────────────────
  const myRequests = await getMyReturnRequests(session.user.id);

  return (
    <div className="space-y-6">
      <FadeIn>
        <GlassCard className="relative overflow-hidden px-6 py-5">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full opacity-20 blur-[70px]"
            style={{ background: "radial-gradient(circle, var(--glow-purple), transparent 70%)" }}
          />
          <div className="relative flex items-center gap-3">
            <span className="glow-icon-chip flex size-10 items-center justify-center rounded-xl text-primary">
              <Undo2 className="size-5" />
            </span>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">My Return Requests</h1>
              <p className="text-sm text-muted-foreground">
                Return requests you have submitted.
              </p>
            </div>
          </div>
        </GlassCard>
      </FadeIn>

      <FadeIn delay={60}>
        <DashboardSection title="Request History">
          {myRequests.length === 0 ? (
            <EmptyState
              icon={Undo2}
              title="No return requests"
              description="Return requests you submit from your assets will appear here."
            />
          ) : (
            myRequests.map((req) => (
              <ActivityRow
                key={req.id}
                primary={req.assetName}
                secondary={`${req.assetTag} · ${req.reason}`}
                meta={formatDate(req.requestedAt)}
                badge={<ReturnRequestStatusBadge status={req.status} />}
              />
            ))
          )}
        </DashboardSection>
      </FadeIn>
    </div>
  );
}
