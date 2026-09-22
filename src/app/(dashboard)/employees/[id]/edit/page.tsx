import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import { GlassCard } from "@/components/design-system/glass-card";
import { FadeIn } from "@/components/design-system/fade-in";
import { EmployeeForm } from "@/components/employees/employee-form";
import { updateEmployee } from "@/lib/actions/employee-actions";
import { requireRole } from "@/lib/auth-guards";
import { getEmployeeById } from "@/lib/data/employees";

interface EditEmployeePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEmployeePage({
  params,
}: EditEmployeePageProps) {
  await requireRole("ADMIN");
  const { id } = await params;

  const employee = await getEmployeeById(id);
  if (!employee) notFound();

  const updateThisEmployee = updateEmployee.bind(null, employee.id);

  return (
    <div className="space-y-6">
      <FadeIn>
        <GlassCard className="relative overflow-hidden px-6 py-5">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full opacity-20 blur-[60px]"
            style={{
              background:
                "radial-gradient(circle, var(--glow-blue), transparent 70%)",
            }}
          />
          <div className="relative flex items-center gap-3">
            <span className="glow-icon-chip flex size-10 items-center justify-center rounded-xl text-primary">
              <Pencil className="size-5" />
            </span>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                Edit Employee
              </h1>
              <p className="font-mono text-sm text-muted-foreground">
                {employee.employeeCode} · {employee.name}
              </p>
            </div>
          </div>
        </GlassCard>
      </FadeIn>

      <FadeIn delay={60}>
        <GlassCard className="p-6">
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
        </GlassCard>
      </FadeIn>
    </div>
  );
}
