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
import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { RequestReturnDialog } from "@/components/assets/request-return-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { InfoGrid } from "@/components/shared/info-grid";
import { PageHeader } from "@/components/shared/page-header";
import {
  AssetStatusBadge,
  EmployeeStatusBadge,
  ReturnRequestStatusBadge,
} from "@/components/shared/status-badge";
import { requireAuth } from "@/lib/auth-guards";
import { getEmployeeProfile } from "@/lib/data/profile";
import { formatDate } from "@/lib/utils";

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
  const profile = await getEmployeeProfile(session.user.id);

  if (!profile) {
    notFound();
  }

  const { account, employee, assignedAssets, pendingReturnRequests, custodyHistory } =
    profile;
  const isAdmin = account.role === "ADMIN";

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description={
          isAdmin
            ? "View and manage your administrator profile and account details."
            : "View and manage your employee profile, account details, and assigned assets."
        }
      />

      {/* ─── Profile Summary Header Card ─── */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 border-2 border-border shadow-inner">
              {account.image ? (
                <AvatarImage src={account.image} alt={account.name} />
              ) : null}
              <AvatarFallback className="text-lg font-semibold">
                {initials(employee?.name ?? account.name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">
                  {employee?.name ?? account.name}
                </h2>
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
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {employee ? (
              <EmployeeStatusBadge status={employee.status} />
            ) : null}
            <Badge
              variant={isAdmin ? "default" : "secondary"}
              className="gap-1 font-medium"
            >
              {isAdmin ? (
                <ShieldCheck className="size-3.5" />
              ) : (
                <Shield className="size-3.5" />
              )}
              {account.role}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ─── Section 1: Contact Details & Personal Info (Editable) ─── */}
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="font-semibold text-base">Contact Information</h3>
              <p className="text-xs text-muted-foreground">
                {employee
                  ? "Update your display name and direct phone number."
                  : "Update your account display name."}
              </p>
            </div>
            <UserCheck className="size-5 text-muted-foreground" />
          </div>

          <ProfileEditForm
            initialName={employee?.name ?? account.name}
            initialPhone={employee?.phone}
            showPhone={employee !== null}
            isAdmin={isAdmin}
          />
        </div>

        {/* ─── Section 2: Account & Security Information (Read-Only) ─── */}
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="font-semibold text-base">Account & Access</h3>
              <p className="text-xs text-muted-foreground">
                Login identity and authentication settings.
              </p>
            </div>
            <Lock className="size-5 text-muted-foreground" />
          </div>

          <InfoGrid
            items={[
              { label: "Account Email", value: account.email },
              { label: "Role", value: account.role },
              { label: "Account Status", value: "Active & Verified" },
              { label: "Member Since", value: formatDate(account.createdAt) },
            ]}
          />

          <div className="rounded-md border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground flex items-center gap-2">
            <Mail className="size-4 shrink-0 text-muted-foreground" />
            <span>
              Primary login email is verified and protected. Role and security settings are server-enforced.
            </span>
          </div>
        </div>

        {/* ─── Section 3: Organization Details (When linked to Employee directory) ─── */}
        {employee ? (
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-semibold text-base">Organization & Directory Information</h3>
                <p className="text-xs text-muted-foreground">
                  Official company employment record managed by Human Resources / Admin.
                </p>
              </div>
              <Building2 className="size-5 text-muted-foreground" />
            </div>

            <InfoGrid
              items={[
                { label: "Employee ID", value: employee.employeeCode },
                { label: "Department", value: employee.department ?? "—" },
                { label: "Job Title / Position", value: employee.designation ?? "—" },
                { label: "Employment Status", value: employee.status },
                { label: "Company Directory Email", value: employee.email ?? account.email },
                { label: "Record Created", value: formatDate(employee.createdAt) },
              ]}
            />
          </div>
        ) : isAdmin ? (
          /* ─── Admin Scope & Permissions Card (When system admin has no directory record) ─── */
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-semibold text-base">Administrator Privileges & Scope</h3>
                <p className="text-xs text-muted-foreground">
                  Administrative access overview for AssetFlow platform management.
                </p>
              </div>
              <ShieldCheck className="size-5 text-muted-foreground" />
            </div>

            <InfoGrid
              items={[
                { label: "Access Level", value: "Full Administrative Access" },
                { label: "Asset Management", value: "CRUD, Locations, Specs, Retirement" },
                { label: "Employee Directory", value: "Manage Staff, Onboarding, Status" },
                { label: "Assignments & Maintenance", value: "Issue Equipment, Review Returns, Repairs" },
                { label: "Audit Log Access", value: "Full System Audit Trail" },
                { label: "Directory Link", value: "System Administrator (Root Account)" },
              ]}
            />
          </div>
        ) : null}
      </div>

      {/* ─── Section 4: Assigned Assets in Custody (For users with linked Employee record) ─── */}
      {employee ? (
        <>
          <DashboardSection
            title="Assigned Assets in Your Custody"
            description="Company equipment currently issued to you."
          >
            {assignedAssets.length === 0 ? (
              <EmptyState
                icon={Boxes}
                title="No assets assigned"
                description="Company assets assigned to you by an administrator will appear here."
              />
            ) : (
              <div className="divide-y divide-border rounded-md border border-border bg-card">
                {assignedAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex flex-wrap items-center justify-between gap-4 p-4 text-sm transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/assets/${asset.assetId}`}
                          className="font-medium hover:underline flex items-center gap-1.5"
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

                    <div className="flex shrink-0 items-center gap-3">
                      <AssetStatusBadge status={asset.status} />
                      {asset.status === "ASSIGNED" ? (
                        <RequestReturnDialog assetId={asset.assetId} />
                      ) : null}
                      {asset.status === "RETURN_REQUESTED" ? (
                        <span className="text-xs text-muted-foreground">
                          Return request pending review
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardSection>

          {/* ─── Section 5: Pending Return Requests & Custody History ─── */}
          <div className="grid gap-6 lg:grid-cols-2">
            <DashboardSection
              title="Pending Return Requests"
              description="Requests awaiting administrator review."
            >
              {pendingReturnRequests.length === 0 ? (
                <EmptyState
                  icon={Undo2}
                  title="No pending requests"
                  description="Asset return requests you submit will appear here until reviewed."
                />
              ) : (
                <div className="divide-y divide-border rounded-md border border-border bg-card">
                  {pendingReturnRequests.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between gap-3 p-3 text-sm"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <p className="font-medium truncate">{req.assetName}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {req.assetTag} · &ldquo;{req.reason}&rdquo;
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <ReturnRequestStatusBadge status={req.status} />
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(req.requestedAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DashboardSection>

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
                <div className="divide-y divide-border rounded-md border border-border bg-card">
                  {custodyHistory.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-3 text-sm"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <p className="font-medium truncate">{item.assetName}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.assetTag} · {item.returnedAt ? "Returned" : "Active Custody"}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatDate(item.returnedAt ?? item.assignedAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </DashboardSection>
          </div>
        </>
      ) : null}
    </div>
  );
}
