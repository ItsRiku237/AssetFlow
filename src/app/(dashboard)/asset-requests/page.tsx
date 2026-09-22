import Image from "next/image";
import { PackagePlus, Clock, CheckCircle2, XCircle } from "lucide-react";

import { GlassCard } from "@/components/design-system/glass-card";
import { FadeIn } from "@/components/design-system/fade-in";
import { AssetRequestsTable } from "@/components/asset-requests/asset-requests-table";
import { EmptyState } from "@/components/shared/empty-state";
import { requireRole } from "@/lib/auth-guards";
import { getAssetRequests } from "@/lib/data/asset-requests";

export default async function AssetRequestsPage() {
  await requireRole("ADMIN");
  const requests = await getAssetRequests();

  const pending = requests.filter((r) => r.status === "PENDING").length;
  const approved = requests.filter((r) => r.status === "APPROVED").length;
  const rejected = requests.filter((r) => r.status === "REJECTED").length;

  return (
    <div className="data-page-with-controls has-sticky-filter space-y-5">
      {/* ── Hero ──────────────────────────────────────────────── */}
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
            <div className="absolute inset-0 bg-gradient-to-r from-background/96 via-background/88 to-background/70" />
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 size-52 rounded-full opacity-20 blur-[80px]"
            style={{ background: "radial-gradient(circle, var(--glow-cyan), transparent 70%)" }}
          />
          <div className="relative flex flex-wrap items-center justify-between gap-4 px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="glow-icon-chip flex size-11 items-center justify-center rounded-xl text-primary">
                <PackagePlus className="size-5" />
              </span>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">Asset Requests</h1>
                <p className="text-sm text-muted-foreground">
                  Employee requests to be assigned assets — approve to create an assignment.
                </p>
              </div>
            </div>
            {/* Summary chips */}
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

      {/* ── Table ─────────────────────────────────────────────── */}
      <FadeIn delay={60}>
        {requests.length === 0 ? (
          <EmptyState
            icon={PackagePlus}
            title="No asset requests yet"
            description="Employee asset requests will appear here for review."
          />
        ) : (
          <GlassCard className="overflow-visible rounded-xl p-0">
            <AssetRequestsTable requests={requests} />
          </GlassCard>
        )}
      </FadeIn>
    </div>
  );
}
