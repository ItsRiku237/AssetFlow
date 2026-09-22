import Link from "next/link";
import { Plus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/design-system/glass-card";
import { FadeIn } from "@/components/design-system/fade-in";
import { EmployeeFilters } from "@/components/employees/employee-filters";
import { EmployeeTable } from "@/components/employees/employee-table";
import { EmptyState } from "@/components/shared/empty-state";
import { getDepartments, getEmployees } from "@/lib/data/employees";
import { requireRole } from "@/lib/auth-guards";
import type { EmployeeStatus } from "@/types/employee";

const VALID_STATUSES: readonly EmployeeStatus[] = ["ACTIVE", "INACTIVE"];

function isEmployeeStatus(value: string | undefined): value is EmployeeStatus {
  return !!value && (VALID_STATUSES as readonly string[]).includes(value);
}

interface EmployeesPageProps {
  searchParams: Promise<{ q?: string; department?: string; status?: string }>;
}

export default async function EmployeesPage({
  searchParams,
}: EmployeesPageProps) {
  await requireRole("ADMIN");

  const params = await searchParams;
  const search = params.q?.trim() || undefined;
  const department = params.department?.trim() || undefined;
  const status = isEmployeeStatus(params.status) ? params.status : undefined;

  const [employees, departments] = await Promise.all([
    getEmployees({ search, department, status }),
    getDepartments(),
  ]);

  const hasActiveFilters = Boolean(search || department || status);

  return (
    <div className="space-y-6">
      {/* ── Premium page hero ─────────────────────────────────── */}
      <FadeIn>
        <GlassCard className="relative overflow-hidden px-6 py-5">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full opacity-20 blur-[70px]"
            style={{
              background:
                "radial-gradient(circle, var(--glow-blue), transparent 70%)",
            }}
          />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="glow-icon-chip flex size-10 items-center justify-center rounded-xl text-primary">
                <Users className="size-5" />
              </span>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">
                  Employees
                </h1>
                <p className="text-sm text-muted-foreground">
                  {employees.length}{" "}
                  {employees.length === 1 ? "employee" : "employees"}
                  {hasActiveFilters ? " matched" : " total"}
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/employees/new">
                <Plus className="size-4" />
                Add Employee
              </Link>
            </Button>
          </div>
        </GlassCard>
      </FadeIn>

      {/* ── Glass filter bar ──────────────────────────────────── */}
      <FadeIn delay={60}>
        <GlassCard className="px-4 py-3">
          <EmployeeFilters departments={departments} />
        </GlassCard>
      </FadeIn>

      {/* ── Employee table ────────────────────────────────────── */}
      <FadeIn delay={120}>
        {employees.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No employees found"
            description={
              hasActiveFilters
                ? "Try adjusting or clearing your filters."
                : "Add your first employee to get started."
            }
          />
        ) : (
          <GlassCard className="overflow-hidden p-0">
            <EmployeeTable employees={employees} />
          </GlassCard>
        )}
      </FadeIn>
    </div>
  );
}
