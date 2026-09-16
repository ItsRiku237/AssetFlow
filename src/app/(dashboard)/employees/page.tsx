import Link from "next/link";
import { Plus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmployeeFilters } from "@/components/employees/employee-filters";
import { EmployeeTable } from "@/components/employees/employee-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
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

export default async function EmployeesPage({ searchParams }: EmployeesPageProps) {
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
      <PageHeader
        title="Employees"
        description="The company employee directory — including employees who don't have a login account yet."
        actions={
          <Button asChild>
            <Link href="/employees/new">
              <Plus className="size-4" />
              Add Employee
            </Link>
          </Button>
        }
      />

      <EmployeeFilters departments={departments} />

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
        <EmployeeTable employees={employees} />
      )}
    </div>
  );
}
