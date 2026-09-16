import { EmployeeForm } from "@/components/employees/employee-form";
import { PageHeader } from "@/components/shared/page-header";
import { createEmployee } from "@/lib/actions/employee-actions";
import { requireRole } from "@/lib/auth-guards";

export default async function NewEmployeePage() {
  await requireRole("ADMIN");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Employee"
        description="Create a directory record — an Employee ID and name are enough to get started. They can link a login account later."
      />
      <EmployeeForm action={createEmployee} submitLabel="Create employee" />
    </div>
  );
}
