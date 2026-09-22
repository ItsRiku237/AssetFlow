import { UserPlus } from "lucide-react";

import { GlassCard } from "@/components/design-system/glass-card";
import { FadeIn } from "@/components/design-system/fade-in";
import { EmployeeForm } from "@/components/employees/employee-form";
import { createEmployee } from "@/lib/actions/employee-actions";
import { requireRole } from "@/lib/auth-guards";

export default async function NewEmployeePage() {
  await requireRole("ADMIN");

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
              <UserPlus className="size-5" />
            </span>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                Add Employee
              </h1>
              <p className="text-sm text-muted-foreground">
                An Employee ID and name are enough to get started — they can
                link a login account later.
              </p>
            </div>
          </div>
        </GlassCard>
      </FadeIn>

      <FadeIn delay={60}>
        <GlassCard className="p-6">
          <EmployeeForm action={createEmployee} submitLabel="Create employee" />
        </GlassCard>
      </FadeIn>
    </div>
  );
}
