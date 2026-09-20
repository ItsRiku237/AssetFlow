import { notFound } from "next/navigation";

import { EmployeeForm } from "@/components/employees/employee-form";
import { PageHeader } from "@/components/shared/page-header";
import { updateEmployee } from "@/lib/actions/employee-actions";
import { requireRole } from "@/lib/auth-guards";
import { getEmployeeById } from "@/lib/data/employees";

interface EditEmployeePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEmployeePage({ params }: EditEmployeePageProps) {
  await requireRole("ADMIN");
  const { id } = await params;

  const employee = await getEmployeeById(id);
  if (!employee) notFound();

  const updateThisEmployee = updateEmployee.bind(null, employee.id);

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Employee" description={employee.employeeCode} />
      <EmployeeForm
        action={updateThisEmployee}
        submitLabel="Save changes"
        showStatus
        defaultValues={{
          employeeCode: employee.employeeCode,
          name: employee.name,
          email: employee.email ?? undefined,
          department: employee.department ?? undefined,
          designation: employee.designation ?? undefined,
          phone: employee.phone ?? undefined,
          status: employee.status,
        }}
      />
    </div>
  );
}
