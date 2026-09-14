import Link from "next/link";
import { notFound } from "next/navigation";
import { Boxes } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { EmptyState } from "@/components/shared/empty-state";
import { InfoGrid } from "@/components/shared/info-grid";
import { PageHeader } from "@/components/shared/page-header";
import { AssetStatusBadge } from "@/components/shared/status-badge";
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
        description={employee.designation}
      />

      <div className="space-y-4 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            {employee.image ? (
              <AvatarImage src={employee.image} alt="" />
            ) : null}
            <AvatarFallback>{initials(employee.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{employee.name}</p>
            <p className="text-sm text-muted-foreground">{employee.email}</p>
          </div>
          <Badge
            className="ml-auto"
            variant={employee.role === "ADMIN" ? "default" : "secondary"}
          >
            {employee.role}
          </Badge>
        </div>

        <InfoGrid
          items={[
            { label: "Employee ID", value: employee.employeeCode },
            { label: "Department", value: employee.department },
            { label: "Designation", value: employee.designation },
            { label: "Phone", value: employee.phone ?? "—" },
            { label: "Joined", value: formatDate(employee.joinedAt) },
            {
              label: "Assigned assets",
              value: String(employee.assignedAssets.length),
            },
          ]}
        />
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
