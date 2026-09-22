import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Boxes,
  Building2,
  Calendar,
  IdCard,
  Mail,
  Pencil,
  Phone,
  Shield,
  UserCircle,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/design-system/glass-card";
import { FadeIn } from "@/components/design-system/fade-in";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { DeleteEmployeeButton } from "@/components/employees/delete-employee-button";
import {
  DeactivateEmployeeButton,
  ReactivateEmployeeButton,
} from "@/components/employees/employee-status-button";
import { EmptyState } from "@/components/shared/empty-state";
import {
  AccountLinkBadge,
  AssetStatusBadge,
  EmployeeStatusBadge,
} from "@/components/shared/status-badge";
import { getEmployeeById } from "@/lib/data/employees";
import { requireRole } from "@/lib/auth-guards";
import { formatDate, cn } from "@/lib/utils";

interface EmployeeDetailPageProps {
  params: Promise<{ id: string }>;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Administrator",
  EMPLOYEE: "Employee",
};

export default async function EmployeeDetailPage({
  params,
}: EmployeeDetailPageProps) {
  await requireRole("ADMIN");
  const { id } = await params;

  const employee = await getEmployeeById(id);
  if (!employee) notFound();

  return (
    <div className="space-y-6">
      {/* ── Profile hero ─────────────────────────────────────── */}
      <FadeIn>
        <GlassCard className="relative overflow-hidden p-6">
          {/* Decorative glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full opacity-20 blur-[80px]"
            style={{
              background:
                "radial-gradient(circle, var(--glow-cyan), transparent 70%)",
            }}
          />

          <div className="relative flex flex-wrap items-start gap-4">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="size-20 border-2 border-border text-2xl font-bold shadow-lg">
                {employee.account?.image ? (
                  <AvatarImage src={employee.account.image} alt="" />
                ) : null}
                <AvatarFallback className="bg-primary/15 font-semibold text-primary text-xl">
                  {initials(employee.name)}
                </AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  "absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-card",
                  employee.status === "ACTIVE"
                    ? "bg-success"
                    : "bg-muted-foreground"
                )}
              />
            </div>

            {/* Identity */}
            <div className="flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">
                  {employee.name}
                </h1>
                <EmployeeStatusBadge status={employee.status} />
                <AccountLinkBadge linked={employee.account !== null} />
              </div>
              <p className="text-sm text-muted-foreground">
                {employee.designation ?? "No position on file"}
                {employee.department ? ` · ${employee.department}` : ""}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                {employee.employeeCode}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/employees/${employee.id}/edit`}>
                  <Pencil className="size-4" />
                  Edit
                </Link>
              </Button>
              {employee.status === "ACTIVE" ? (
                <DeactivateEmployeeButton employeeId={employee.id} />
              ) : (
                <ReactivateEmployeeButton employeeId={employee.id} />
              )}
              <DeleteEmployeeButton
                employeeId={employee.id}
                employeeName={employee.name}
              />
            </div>
          </div>
        </GlassCard>
      </FadeIn>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* ── Contact & org info ──────────────────────────────── */}
        <FadeIn delay={60} className="lg:col-span-2">
          <GlassCard className="space-y-4 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Employee Information
            </p>
            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  icon: IdCard,
                  label: "Employee ID",
                  value: employee.employeeCode,
                  mono: true,
                },
                {
                  icon: Mail,
                  label: "Email",
                  value: employee.email ?? "—",
                },
                {
                  icon: Phone,
                  label: "Phone",
                  value: employee.phone ?? "—",
                },
                {
                  icon: Building2,
                  label: "Department",
                  value: employee.department ?? "—",
                },
                {
                  icon: UserCircle,
                  label: "Position",
                  value: employee.designation ?? "—",
                },
                {
                  icon: Calendar,
                  label: "Added",
                  value: formatDate(employee.createdAt),
                },
              ].map(({ icon: Icon, label, value, mono }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <span className="glow-icon-chip mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md text-primary">
                    <Icon className="size-3.5" />
                  </span>
                  <div>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd
                      className={cn(
                        "text-sm",
                        mono && "font-mono"
                      )}
                    >
                      {value}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </GlassCard>
        </FadeIn>

        {/* ── Account / login info ─────────────────────────────── */}
        <FadeIn delay={120}>
          <GlassCard className="space-y-4 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Login Account
            </p>
            {employee.account ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="glow-icon-chip flex size-7 shrink-0 items-center justify-center rounded-md text-primary">
                    <Shield className="size-3.5" />
                  </span>
                  <div>
                    <p className="text-xs text-muted-foreground">Role</p>
                    <Badge
                      variant={
                        employee.account.role === "ADMIN" ||
                        employee.account.role === "SUPER_ADMIN"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {ROLE_LABEL[employee.account.role] ??
                        employee.account.role}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="glow-icon-chip flex size-7 shrink-0 items-center justify-center rounded-md text-primary">
                    <Mail className="size-3.5" />
                  </span>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Login email
                    </p>
                    <p className="truncate text-sm">{employee.account.email}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-4 text-center">
                <UserCircle className="mx-auto mb-2 size-8 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  No login account linked yet. The employee can register with
                  their email to link their account.
                </p>
              </div>
            )}
          </GlassCard>
        </FadeIn>
      </div>

      {/* ── Assigned assets ──────────────────────────────────── */}
      <FadeIn delay={180}>
        <DashboardSection
          title="Currently Assigned Assets"
          description={`${employee.assignedAssets.length} asset${employee.assignedAssets.length !== 1 ? "s" : ""} in custody`}
          viewAllHref="/assets"
        >
          {employee.assignedAssets.length === 0 ? (
            <EmptyState
              icon={Boxes}
              title="No assets assigned"
              description="This employee doesn't currently have any assets checked out."
            />
          ) : (
            <div className="divide-y divide-border/70">
              {employee.assignedAssets.map((asset) => (
                <Link
                  key={asset.id}
                  href={`/assets/${asset.assetId}`}
                  className="flex items-center justify-between gap-3 py-3 text-sm transition-colors hover:bg-accent/40 -mx-1 px-1 rounded-md"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="glow-icon-chip flex size-8 shrink-0 items-center justify-center rounded-lg text-primary">
                      <Boxes className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{asset.assetName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {asset.assetTag} · Since {formatDate(asset.assignedAt)}
                      </p>
                    </div>
                  </div>
                  <AssetStatusBadge status={asset.status} />
                </Link>
              ))}
            </div>
          )}
        </DashboardSection>
      </FadeIn>
    </div>
  );
}
