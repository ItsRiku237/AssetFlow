import { Users } from "lucide-react";

import { EmployeeFilters } from "@/components/employees/employee-filters";
import { EmployeeTable } from "@/components/employees/employee-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { getDepartments, getEmployees } from "@/lib/data/employees";
import { requireRole } from "@/lib/auth-guards";

interface EmployeesPageProps {
  searchParams: Promise<{ q?: string; department?: string }>;
}

export default async function EmployeesPage({ searchParams }: EmployeesPageProps) {
  await requireRole("ADMIN");

  const params = await searchParams;
  const search = params.q?.trim() || undefined;
  const department = params.department?.trim() || undefined;

  const [employees, departments] = await Promise.all([
    getEmployees({ search, department }),
    getDepartments(),
  ]);

  const hasActiveFilters = Boolean(search || department);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Everyone with access to AssetFlow and what's assigned to them."
      />

      <EmployeeFilters departments={departments} />

      {employees.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No employees found"
          description={
            hasActiveFilters
              ? "Try adjusting or clearing your filters."
              : "Employee accounts will appear here once created."
          }
        />
      ) : (
        <EmployeeTable employees={employees} />
      )}
    </div>
  );
}
