import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Boxes,
  Building2,
  ExternalLink,
  History,
  Lock,
  Mail,
  Shield,
  ShieldCheck,
  Undo2,
  UserCheck,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { FadeIn } from "@/components/design-system/fade-in";
import { GlassCard } from "@/components/design-system/glass-card";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { RequestReturnDialog } from "@/components/assets/request-return-dialog";
import { ActivityRow } from "@/components/dashboard/activity-row";
import { EmptyState } from "@/components/shared/empty-state";
import { InfoGrid } from "@/components/shared/info-grid";
import {
  AssetStatusBadge,
  EmployeeStatusBadge,
  ReturnRequestStatusBadge,
} from "@/components/shared/status-badge";
import { requireAuth } from "@/lib/auth-guards";
import { getEmployeeProfile } from "@/lib/data/profile";
import { cn, formatDate } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function ProfilePage() {
  const session = await requireAuth();
  const profile = await getEmployeeProfile(session.user.id, session.user.email);
  if (!profile) notFound();

  const { account, employee, assignedAssets, pendingReturnRequests, custodyHistory } = profile;
  const isAdmin = account.role === "ADMIN" || account.role === "SUPER_ADMIN";
  const isSuperAdmin = account.role === "SUPER_ADMIN";

  return (
    <div className="space-y-5">
      {/* ── Hero ────────────────────────────────────────────────── */}
      <FadeIn>
        <GlassCard className="relative overflow-hidden px-6 py-6 sm:px-8">
          {/* Glow layer */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-grid-pattern opacity-20 [mask-image:linear-gradient(to_bottom,#000,transparent)]" />
            <div
              className="animate-af-glow-pulse absolute -right-16 -top-16 size-64 rounded-full opacity-30 blur-[80px]"
              style={{ background: "radial-gradient(circle, var(--glow-cyan), transparent 70%)" }}
            />
            <div
              className="absolute -bottom-16 left-8 size-48 rounded-full opacity-20 blur-[70px]"
              style={{ background: "radial-gradient(circle, var(--glow-purple), transparent 70%)" }}
            />
          </div>

          <div className="relative flex flex-wrap items-center justify-between gap-5">
            {/* Avatar + identity */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar
                  className={cn(
                    "size-16 border-2 shadow-lg",
                    isSuperAdmin
                      ? "border-primary/60 ring-2 ring-primary/20"
                      : "border-border"
                  )}
                >
                  {account.image ? (
                    <AvatarImage src={account.image} alt={account.name} />
                  ) : null}
                  <AvatarFallback
                    className={cn(
                      "text-lg font-semibold",
                      isSuperAdmin && "bg-primary/10 text-primary"
                    )}
                  >
                    {initials(employee?.name ?? account.name)}
                  </AvatarFallback>
                </Avatar>
                {/* Online dot */}
                <span className="absolute bottom-0.5 right-0.5 size-3 rounded-full border-2 border-card bg-success" />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-semibold tracking-tight">
                    {employee?.name ?? account.name}
                  </h1>
                  {employee ? (
                    <Badge variant="outline" className="font-mono text-xs">
                      {employee.employeeCode}
                    </Badge>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  {employee?.designation ?? (isAdmin ? "System Administrator" : "Employee")}
                  {employee?.department ? ` · ${employee.department}` : ""}
                </p>
                <p className="text-xs text-muted-foreground/60">{account.email}</p>
              </div>
            </div>

            {/* Role / status badges */}
            <div className="flex flex-wrap items-center gap-2">
              {employee ? <EmployeeStatusBadge status={employee.status} /> : null}
              <Badge
                variant={isAdmin ? "default" : "secondary"}
                className={cn(
                  "gap-1.5 font-medium",
                  isSuperAdmin && "border border-primary/30 bg-primary/10 text-primary"
                )}
              >
                {isSuperAdmin ? (
                  <ShieldCheck className="size-3.5" />
                ) : isAdmin ? (
                  <Shield className="size-3.5" />
                ) : (
                  <UserCheck className="size-3.5" />
                )}
                {account.role === "SUPER_ADMIN"
                  ? "Super Admin"
                  : account.role === "ADMIN"
                  ? "Admin"
                  : "Employee"}
              </Badge>
            </div>
          </div>
        </GlassCard>
      </FadeIn>

      {/* ── Contact + Account cards ──────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Editable: contact info */}
        <FadeIn delay={60}>
          <GlassCard className="space-y-4 p-5">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <h2 className="font-semibold">Contact Information</h2>
                <p className="text-xs text-muted-foreground">
                  {employee
                    ? "Update your display name and phone number."
                    : "Update your account display name."}
                </p>
              </div>
              <div className="glow-icon-chip flex size-8 items-center justify-center rounded-lg text-primary">
                <UserCheck className="size-4" />
              </div>
            </div>
            <ProfileEditForm
              initialName={employee?.name ?? account.name}
              initialPhone={employee?.phone}
              showPhone={employee !== null}
              isAdmin={isAdmin}
            />
          </GlassCard>
        </FadeIn>

        {/* Read-only: account & access */}
        <FadeIn delay={90}>
          <GlassCard className="space-y-4 p-5">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <h2 className="font-semibold">Account & Access</h2>
                <p className="text-xs text-muted-foreground">
                  Login identity and security settings.
                </p>
              </div>
              <div className="glow-icon-chip flex size-8 items-center justify-center rounded-lg text-primary">
                <Lock className="size-4" />
              </div>
            </div>

            <InfoGrid
              items={[
                { label: "Account Email", value: account.email },
                { label: "Role", value: account.role === "SUPER_ADMIN" ? "Super Admin" : account.role === "ADMIN" ? "Admin" : "Employee" },
                { label: "Account Status", value: "Active" },
                { label: "Member Since", value: formatDate(account.createdAt) },
              ]}
            />

            <div className="flex items-start gap-2 rounded-lg border border-dashed border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
              <Mail className="mt-0.5 size-3.5 shrink-0" />
              <span>
                Primary login email is verified and server-enforced. Role and security settings cannot be modified here.
              </span>
            </div>
          </GlassCard>
        </FadeIn>
      </div>

      {/* ── Organization / Admin scope card ─────────────────────── */}
      <FadeIn delay={120}>
        {employee ? (
          <GlassCard className="space-y-4 p-5">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <h2 className="font-semibold">Organization & Directory</h2>
                <p className="text-xs text-muted-foreground">
                  Official employment record managed by Human Resources / Admin.
                </p>
              </div>
              <div className="glow-icon-chip flex size-8 items-center justify-center rounded-lg text-primary">
                <Building2 className="size-4" />
              </div>
            </div>
            <InfoGrid
              items={[
                { label: "Employee ID", value: employee.employeeCode },
                { label: "Department", value: employee.department ?? "—" },
                { label: "Job Title", value: employee.designation ?? "—" },
                { label: "Employment Status", value: employee.status },
                { label: "Directory Email", value: employee.email ?? account.email },
                { label: "Record Created", value: formatDate(employee.createdAt) },
              ]}
            />
          </GlassCard>
        ) : isAdmin ? (
          <GlassCard className="space-y-4 p-5">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <h2 className="font-semibold">Administrator Privileges</h2>
                <p className="text-xs text-muted-foreground">
                  System access overview for ADP AssetHub platform management.
                </p>
              </div>
              <div className="glow-icon-chip flex size-8 items-center justify-center rounded-lg text-primary">
                <ShieldCheck className="size-4" />
              </div>
            </div>
            <InfoGrid
              items={[
                { label: "Access Level", value: isSuperAdmin ? "Super Admin" : "Administrator" },
                { label: "Asset Management", value: "CRUD, Locations, Specs, Retirement" },
                { label: "Employee Directory", value: "Staff, Onboarding, Status" },
                { label: "Assignments & Repairs", value: "Assign, Review Returns, Repairs" },
                { label: "Audit Log Access", value: "Full System Audit Trail" },
                { label: "Directory Link", value: "System Administrator" },
              ]}
            />
          </GlassCard>
        ) : null}
      </FadeIn>

      {/* ── Assigned assets ──────────────────────────────────────── */}
      {employee ? (
        <>
          <FadeIn delay={150}>
            <DashboardSection
              title="Assigned Assets"
              description="Company equipment currently issued to you."
            >
              {assignedAssets.length === 0 ? (
                <EmptyState
                  icon={Boxes}
                  title="No assets assigned"
                  description="Company assets assigned to you by an administrator will appear here."
                />
              ) : (
                <div className="space-y-2">
                  {assignedAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/30 px-4 py-3 text-sm transition-colors hover:bg-primary/5"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/assets/${asset.assetId}`}
                            className="font-medium hover:text-primary hover:underline flex items-center gap-1.5 transition-colors"
                          >
                            {asset.assetName}
                            <ExternalLink className="size-3 text-muted-foreground" />
                          </Link>
                          <Badge variant="outline" className="font-mono text-xs">
                            {asset.assetTag}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {asset.type}
                          {asset.brand || asset.model
                            ? ` · ${[asset.brand, asset.model].filter(Boolean).join(" ")}`
                            : ""}
                          {" · "}Issued {formatDate(asset.assignedAt)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <AssetStatusBadge status={asset.status} />
                        {asset.status === "ASSIGNED" ? (
                          <RequestReturnDialog assetId={asset.assetId} />
                        ) : null}
                        {asset.status === "RETURN_REQUESTED" ? (
                          <span className="text-xs text-muted-foreground">Return pending review</span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DashboardSection>
          </FadeIn>

          {/* ── Return requests + custody history ──────────────── */}
          <div className="grid gap-4 lg:grid-cols-2">
            <FadeIn delay={180}>
              <DashboardSection
                title="Pending Return Requests"
                description="Requests awaiting admin review."
              >
                {pendingReturnRequests.length === 0 ? (
                  <EmptyState
                    icon={Undo2}
                    title="No pending requests"
                    description="Asset return requests you submit will appear here until reviewed."
                  />
                ) : (
                  pendingReturnRequests.map((req) => (
                    <ActivityRow
                      key={req.id}
                      primary={req.assetName}
                      secondary={`${req.assetTag} · "${req.reason}"`}
                      meta={formatDate(req.requestedAt)}
                      badge={<ReturnRequestStatusBadge status={req.status} />}
                    />
                  ))
                )}
              </DashboardSection>
            </FadeIn>

            <FadeIn delay={210}>
              <DashboardSection
                title="Recent Custody History"
                description="Your recent equipment assignments and returns."
              >
                {custodyHistory.length === 0 ? (
                  <EmptyState
                    icon={History}
                    title="No custody history"
                    description="Past equipment assignments and returns will be logged here."
                  />
                ) : (
                  custodyHistory.map((item) => (
                    <ActivityRow
                      key={item.id}
                      primary={item.assetName}
                      secondary={`${item.assetTag} · ${item.returnedAt ? "Returned" : "Active"}`}
                      meta={formatDate(item.returnedAt ?? item.assignedAt)}
                    />
                  ))
                )}
              </DashboardSection>
            </FadeIn>
          </div>
        </>
      ) : null}
    </div>
  );
}
