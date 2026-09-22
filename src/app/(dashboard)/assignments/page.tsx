import Link from "next/link";
import { ClipboardList, Plus, RotateCcw, Boxes } from "lucide-react";

import { AssignmentsFilters } from "@/components/assignments/assignments-filters";
import { AssignmentsTable } from "@/components/assignments/assignments-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { FadeIn } from "@/components/design-system/fade-in";
import { GlassCard } from "@/components/design-system/glass-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth-guards";
import {
  getAssignments,
  getAssignmentStats,
  type AssignmentListFilters,
} from "@/lib/data/assignments";
import type { AssignmentStatus } from "@/types/asset";

const VALID_STATUSES: readonly AssignmentStatus[] = ["ACTIVE", "RETURNED"];

function isAssignmentStatus(v: string | undefined): v is AssignmentStatus {
  return !!v && (VALID_STATUSES as readonly string[]).includes(v);
}

interface AssignmentsPageProps {
  searchParams: Promise<{ q?: string; status?: string }>;
}

export default async function AssignmentsPage({
  searchParams,
}: AssignmentsPageProps) {
  await requireRole("ADMIN");

  const params = await searchParams;
  const filters: AssignmentListFilters = {
    search: params.q?.trim() || undefined,
    status: isAssignmentStatus(params.status) ? params.status : undefined,
  };

  const [assignments, stats] = await Promise.all([
    getAssignments(filters),
    getAssignmentStats(),
  ]);

  const hasActiveFilters = Boolean(filters.search || filters.status);

  return (
    <div className="space-y-5">
      {/* ── Hero ────────────────────────────────────────────── */}
      <FadeIn>
        <GlassCard className="relative overflow-hidden px-6 py-5">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 size-52 rounded-full opacity-20 blur-[80px]"
            style={{ background: "radial-gradient(circle, var(--glow-blue), transparent 70%)" }}
          />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="glow-icon-chip flex size-11 items-center justify-center rounded-xl text-primary">
                <ClipboardList className="size-5" />
              </span>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">Assignments</h1>
                <p className="text-sm text-muted-foreground">
                  Current and historical asset custody records.
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/assets?status=AVAILABLE">
                <Plus className="size-4" />
                Assign Asset
              </Link>
            </Button>
          </div>
        </GlassCard>
      </FadeIn>

      {/* ── Stats ────────────────────────────────────────────── */}
      <FadeIn delay={60}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 max-w-2xl">
          <StatCard label="Active" value={stats.active} icon={Boxes} tone="default" />
          <StatCard label="Returned" value={stats.returned} icon={RotateCcw} tone="success" />
          <StatCard label="Total" value={stats.total} icon={ClipboardList} tone="default" />
        </div>
      </FadeIn>

      {/* ── Filters ──────────────────────────────────────────── */}
      <FadeIn delay={90}>
        <GlassCard className="p-3 sm:p-4">
          <AssignmentsFilters />
        </GlassCard>
      </FadeIn>

      {/* ── Table / empty ────────────────────────────────────── */}
      <FadeIn delay={120}>
        {assignments.length === 0 ? (
          <GlassCard className="p-6">
            <EmptyState
              icon={ClipboardList}
              title="No assignments found"
              description={
                hasActiveFilters
                  ? "Try adjusting or clearing your filters."
                  : "Assign an available asset to an employee to create the first record."
              }
            />
          </GlassCard>
        ) : (
          <GlassCard className="overflow-hidden p-0">
            <AssignmentsTable assignments={assignments} />
          </GlassCard>
        )}
      </FadeIn>
    </div>
  );
}
