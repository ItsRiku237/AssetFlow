import Image from "next/image";
import { Database, ScrollText } from "lucide-react";

import { AuditLogFilters } from "@/components/audit-logs/audit-log-filters";
import { AuditLogPagination } from "@/components/audit-logs/audit-log-pagination";
import { AuditLogTable } from "@/components/audit-logs/audit-log-table";
import { GlassCard } from "@/components/design-system/glass-card";
import { FadeIn } from "@/components/design-system/fade-in";
import { EmptyState } from "@/components/shared/empty-state";
import { requireRole } from "@/lib/auth-guards";
import {
  getAuditLogActions,
  getAuditLogEntityTypes,
  getAuditLogs,
} from "@/lib/data/audit-logs";

interface AuditLogsPageProps {
  searchParams: Promise<{
    q?: string;
    action?: string;
    entityType?: string;
    page?: string;
  }>;
}

export default async function AuditLogsPage({
  searchParams,
}: AuditLogsPageProps) {
  await requireRole("ADMIN");

  const params = await searchParams;
  const search = params.q?.trim() || undefined;
  const action = params.action?.trim() || undefined;
  const entityType = params.entityType?.trim() || undefined;
  const requestedPage = Number(params.page) || 1;

  const [result, actions, entityTypes] = await Promise.all([
    getAuditLogs({ search, action, entityType }, requestedPage),
    getAuditLogActions(),
    getAuditLogEntityTypes(),
  ]);

  const hasActiveFilters = Boolean(search || action || entityType);

  return (
    <div className="space-y-5">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <FadeIn>
        <GlassCard className="relative overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/images/dashboard-hero.webp"
              alt=""
              fill
              className="object-cover opacity-10"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/92 via-background/75 to-transparent" />
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 size-52 rounded-full opacity-20 blur-[80px]"
            style={{ background: "radial-gradient(circle, var(--glow-purple), transparent 70%)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-1/4 size-36 rounded-full opacity-15 blur-[60px]"
            style={{ background: "radial-gradient(circle, var(--glow-cyan), transparent 70%)" }}
          />
          <div className="relative flex flex-wrap items-center justify-between gap-4 px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="glow-icon-chip flex size-11 items-center justify-center rounded-xl text-primary">
                <ScrollText className="size-5" />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  System Audit
                </p>
                <h1 className="text-lg font-semibold tracking-tight">Audit Logs</h1>
                <p className="text-sm text-muted-foreground">
                  A tamper-evident record of significant actions across AssetFlow.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Database className="size-3" /> {result.totalCount} records
            </span>
          </div>
        </GlassCard>
      </FadeIn>

      {/* ── Filters ───────────────────────────────────────────── */}
      <FadeIn delay={60}>
        <GlassCard className="p-3 sm:p-4">
          <AuditLogFilters actions={actions} entityTypes={entityTypes} />
        </GlassCard>
      </FadeIn>

      {/* ── Table / empty ─────────────────────────────────────── */}
      <FadeIn delay={120}>
        {result.items.length === 0 ? (
          <GlassCard className="p-6">
            <EmptyState
              icon={ScrollText}
              title="No audit records found"
              description={
                hasActiveFilters
                  ? "Try adjusting or clearing your filters."
                  : "Actions like assigning assets, approving returns, or logging repairs will appear here."
              }
            />
          </GlassCard>
        ) : (
          <GlassCard className="overflow-hidden p-0">
            <AuditLogTable logs={result.items} />
          </GlassCard>
        )}
      </FadeIn>

      {/* ── Pagination ────────────────────────────────────────── */}
      {result.items.length > 0 ? (
        <FadeIn delay={150}>
          <AuditLogPagination
            page={result.page}
            pageCount={result.pageCount}
            totalCount={result.totalCount}
            pageSize={result.pageSize}
            searchParams={{ q: search, action, entityType }}
          />
        </FadeIn>
      ) : null}
    </div>
  );
}
