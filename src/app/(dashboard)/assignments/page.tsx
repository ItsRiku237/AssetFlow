import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";

import { AssignmentsFilters } from "@/components/assignments/assignments-filters";
import { AssignmentsTable } from "@/components/assignments/assignments-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth-guards";
import {
  getAssignments,
  getAssignmentStats,
  type AssignmentListFilters,
} from "@/lib/data/assignments";
import type { AssignmentStatus } from "@/types/asset";
import { Boxes, RotateCcw } from "lucide-react";

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
    <div className="space-y-6">
      <PageHeader
        title="Assignments"
        description="Current and historical asset custody records."
        actions={
          <Button asChild>
            <Link href="/assets?status=AVAILABLE">
              <Plus className="size-4" />
              Assign Asset
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-3 gap-3 max-w-sm">
        <StatCard label="Active" value={stats.active} icon={Boxes} tone="default" />
        <StatCard
          label="Returned"
          value={stats.returned}
          icon={RotateCcw}
          tone="success"
        />
        <StatCard
          label="Total"
          value={stats.total}
          icon={ClipboardList}
          tone="default"
        />
      </div>

      <AssignmentsFilters />

      {assignments.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No assignments found"
          description={
            hasActiveFilters
              ? "Try adjusting or clearing your filters."
              : "Assign an available asset to an employee to create the first record."
          }
        />
      ) : (
        <AssignmentsTable assignments={assignments} />
      )}
    </div>
  );
}
