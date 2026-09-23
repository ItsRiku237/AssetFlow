import Image from "next/image";
import { CheckCircle2, Clock, History, Wrench } from "lucide-react";

import { GlassCard } from "@/components/design-system/glass-card";
import { FadeIn } from "@/components/design-system/fade-in";
import { AssetsInRepairTable } from "@/components/maintenance/assets-in-repair-table";
import { MaintenanceHistoryTable } from "@/components/maintenance/maintenance-history-table";
import { EmptyState } from "@/components/shared/empty-state";
import { requireRole } from "@/lib/auth-guards";
import {
  getAssetsInRepair,
  getMaintenanceHistory,
} from "@/lib/data/maintenance";

export default async function RepairsPage() {
  await requireRole("ADMIN");

  const [assetsInRepair, history] = await Promise.all([
    getAssetsInRepair(),
    getMaintenanceHistory(),
  ]);

  const inProgress = history.filter((r) => r.status === "IN_PROGRESS").length;
  const completed = history.filter((r) => r.status === "COMPLETED").length;

  return (
    <div className="space-y-5">
      {/* ── Hero ──────────────────────────────────────────────── */}
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
            style={{ background: "radial-gradient(circle, var(--glow-cyan), transparent 70%)" }}
          />
          <div className="relative flex flex-wrap items-center justify-between gap-4 px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="glow-icon-chip flex size-11 items-center justify-center rounded-xl text-primary">
                <Wrench className="size-5" />
              </span>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">
                  Maintenance &amp; Repairs
                </h1>
                <p className="text-sm text-muted-foreground">
                  Assets currently under repair and their full service history.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                <Clock className="size-3" /> {assetsInRepair.length} in repair
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                <Wrench className="size-3" /> {inProgress} in progress
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success">
                <CheckCircle2 className="size-3" /> {completed} completed
              </span>
            </div>
          </div>
        </GlassCard>
      </FadeIn>

      {/* ── Assets in repair ──────────────────────────────────── */}
      <FadeIn delay={60}>
        <GlassCard className="overflow-visible rounded-xl">
          <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
            <span className="glow-icon-chip flex size-7 items-center justify-center rounded-lg text-warning">
              <Wrench className="size-3.5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Assets In Repair</p>
              <p className="text-xs text-muted-foreground">
                Log what&apos;s wrong, then mark repairs complete when they&apos;re done.
              </p>
            </div>
          </div>
          {assetsInRepair.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Wrench}
                title="No assets in repair"
                description="Assets sent for repair from an approved return request will appear here."
              />
            </div>
          ) : (
            <AssetsInRepairTable assets={assetsInRepair} />
          )}
        </GlassCard>
      </FadeIn>

      {/* ── Maintenance history ───────────────────────────────── */}
      <FadeIn delay={120}>
        <GlassCard className="overflow-visible rounded-xl">
          <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
            <span className="glow-icon-chip flex size-7 items-center justify-center rounded-lg text-primary">
              <History className="size-3.5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Maintenance History</p>
              <p className="text-xs text-muted-foreground">
                Every service record, past and present.
              </p>
            </div>
          </div>
          {history.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={History}
                title="No maintenance records yet"
                description="Records will appear here once a repair is logged."
              />
            </div>
          ) : (
            <MaintenanceHistoryTable records={history} />
          )}
        </GlassCard>
      </FadeIn>
    </div>
  );
}
