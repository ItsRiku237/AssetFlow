import Link from "next/link";
import { notFound } from "next/navigation";
import { Boxes, Pencil } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { DeleteEmployeeButton } from "@/components/employees/delete-employee-button";
import {
  DeactivateEmployeeButton,
  ReactivateEmployeeButton,
} from "@/components/employees/employee-status-button";
import { EmptyState } from "@/components/shared/empty-state";
import { InfoGrid } from "@/components/shared/info-grid";
import { PageHeader } from "@/components/shared/page-header";
import {
  AccountLinkBadge,
  AssetStatusBadge,
  EmployeeStatusBadge,
} from "@/components/shared/status-badge";
import { getEmployeeById } from "@/lib/data/employees";
import { requireRole } from "@/lib/auth-guards";
import { formatDate } from "@/lib/utils";

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

export default async function EmployeeDetailPage({
  params,
}: EmployeeDetailPageProps) {
  await requireRole("ADMIN");
  const { id } = await params;

  const employee = await getEmployeeById(id);
  if (!employee) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={employee.name}
        description={employee.designation ?? employee.employeeCode}
        actions={
          <div className="flex items-center gap-2">
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
        }
      />

      <div className="space-y-4 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            {employee.account?.image ? (
              <AvatarImage src={employee.account.image} alt="" />
            ) : null}
            <AvatarFallback>{initials(employee.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{employee.name}</p>
            <p className="text-sm text-muted-foreground">
              {employee.email ?? "No email on file"}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <EmployeeStatusBadge status={employee.status} />
            <AccountLinkBadge linked={employee.account !== null} />
          </div>
        </div>

        <InfoGrid
          items={[
            { label: "Employee ID", value: employee.employeeCode },
            { label: "Department", value: employee.department ?? "—" },
            { label: "Position", value: employee.designation ?? "—" },
            { label: "Phone", value: employee.phone ?? "—" },
            { label: "Added", value: formatDate(employee.createdAt) },
            {
              label: "Assigned assets",
              value: String(employee.assignedAssets.length),
            },
          ]}
        />

        <div className="rounded-md border border-dashed border-border p-3">
          {employee.account ? (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Login account:</span>
              <span>{employee.account.email}</span>
              <Badge variant={employee.account.role === "ADMIN" ? "default" : "secondary"}>
                {employee.account.role}
              </Badge>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Account not linked — this employee has not signed up or been
              linked to a login account yet.
            </p>
          )}
        </div>
      </div>

      <DashboardSection
        title="Currently Assigned Assets"
        description="Assets this employee currently has in their custody."
      >
        {employee.assignedAssets.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title="No assets assigned"
            description="This employee doesn't currently have any assets checked out."
          />
        ) : (
          <div className="divide-y divide-border">
            {employee.assignedAssets.map((asset) => (
              <Link
                key={asset.id}
                href={`/assets/${asset.assetId}`}
                className="flex items-center justify-between gap-3 py-2 text-sm transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{asset.assetName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {asset.assetTag} · Since {formatDate(asset.assignedAt)}
                  </p>
                </div>
                <AssetStatusBadge status={asset.status} />
              </Link>
            ))}
          </div>
        )}
      </DashboardSection>
    </div>
  );
}
