import { notFound } from "next/navigation";

import { AssetActions } from "@/components/assets/asset-actions";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { ActivityRow } from "@/components/dashboard/activity-row";
import { EmptyState } from "@/components/shared/empty-state";
import { InfoGrid } from "@/components/shared/info-grid";
import { PageHeader } from "@/components/shared/page-header";
import {
  AssetStatusBadge,
  ReturnRequestStatusBadge,
} from "@/components/shared/status-badge";
import { getAssetById, isAssetAssignedToUser } from "@/lib/data/assets";
import { getEmployees } from "@/lib/data/employees";
import { requireAuth } from "@/lib/auth-guards";
import { formatDate } from "@/lib/utils";
import { History, Undo2, Wrench } from "lucide-react";

interface AssetDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AssetDetailPage({ params }: AssetDetailPageProps) {
  const session = await requireAuth();
  const { id } = await params;

  const asset = await getAssetById(id);
  if (!asset) notFound();

  if (session.user.role === "EMPLOYEE") {
    const owns = await isAssetAssignedToUser(id, session.user.id);
    if (!owns) notFound();
  }

  const isAdmin = session.user.role === "ADMIN";

  const assignableEmployees =
    isAdmin && asset.status === "AVAILABLE"
      ? (await getEmployees({})).map((e) => ({ id: e.id, name: e.name, department: e.department }))
      : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={asset.name}
        description={`Tag: ${asset.assetTag}`}
        actions={
          isAdmin ? (
            <AssetActions assetId={asset.id} status={asset.status} assignableEmployees={assignableEmployees} />
          ) : undefined
        }
      />
      {/* ...rest of the page unchanged... */}

      <div className="space-y-4 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <AssetStatusBadge status={asset.status} />
          {asset.currentAssignment ? (
            <span className="text-sm text-muted-foreground">
              In custody of {asset.currentAssignment.employeeName} since{" "}
              {formatDate(asset.currentAssignment.assignedAt)}
            </span>
          ) : null}
        </div>

        <InfoGrid
          items={[
            { label: "Type", value: asset.type },
            { label: "Brand", value: asset.brand ?? "—" },
            { label: "Model", value: asset.model ?? "—" },
            { label: "Serial number", value: asset.serialNumber ?? "—" },
            { label: "Processor", value: asset.processor ?? "—" },
            { label: "RAM", value: asset.ram ?? "—" },
            { label: "Storage", value: asset.storage ?? "—" },
            {
              label: "Purchase date",
              value: asset.purchaseDate ? formatDate(asset.purchaseDate) : "—",
            },
            {
              label: "Purchase price",
              value: asset.purchasePrice ? `$${asset.purchasePrice}` : "—",
            },
            {
              label: "Warranty expiry",
              value: asset.warrantyExpiry ? formatDate(asset.warrantyExpiry) : "—",
            },
          ]}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardSection
          title="Assignment History"
          description="Everyone who has custodied this asset."
        >
          {asset.assignmentHistory.length === 0 ? (
            <EmptyState
              icon={History}
              title="No assignment history"
              description="This asset hasn't been assigned yet."
            />
          ) : (
            asset.assignmentHistory.map((a) => (
              <ActivityRow
                key={a.id}
                primary={a.employeeName}
                secondary={a.returnedAt ? "Returned" : "Currently assigned"}
                meta={formatDate(a.returnedAt ?? a.assignedAt)}
              />
            ))
          )}
        </DashboardSection>

        {isAdmin ? (
          <DashboardSection
            title="Return Requests"
            description="Return requests filed for this asset."
          >
            {asset.returnRequests.length === 0 ? (
              <EmptyState
                icon={Undo2}
                title="No return requests"
                description="No one has requested to return this asset."
              />
            ) : (
              asset.returnRequests.map((r) => (
                <ActivityRow
                  key={r.id}
                  primary={r.employeeName}
                  meta={formatDate(r.requestedAt)}
                  badge={<ReturnRequestStatusBadge status={r.status} />}
                />
              ))
            )}
          </DashboardSection>
        ) : null}

        <DashboardSection
          title="Maintenance History"
          description="Service and repair records."
        >
          {asset.maintenanceRecords.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="No maintenance records"
              description="This asset hasn't needed repairs yet."
            />
          ) : (
            asset.maintenanceRecords.map((m) => (
              <ActivityRow
                key={m.id}
                primary={m.issue}
                secondary={m.completedAt ? "Completed" : "In progress"}
                meta={formatDate(m.completedAt ?? m.startedAt)}
              />
            ))
          )}
        </DashboardSection>
      </div>
    </div>
  );
}
