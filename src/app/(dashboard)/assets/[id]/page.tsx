import { notFound } from "next/navigation";

import { AssetActions } from "@/components/assets/asset-actions";
import { RequestReturnDialog } from "@/components/assets/request-return-dialog";
import { RequestAssetDialog } from "@/components/assets/request-asset-dialog";
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
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { History, Undo2, Wrench } from "lucide-react";

import { AssetLocationCard } from "@/components/assets/asset-location-card";
import { AssetLocationForm } from "@/components/assets/asset-location-form";
import { isHardwareAsset, formatStorageSummary } from "@/lib/hardware-specs";

interface AssetDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AssetDetailPage({ params }: AssetDetailPageProps) {
  const session = await requireAuth();
  const { id } = await params;

  const asset = await getAssetById(id);
  if (!asset) notFound();

  const isAdmin =
    session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";

  // For employees: allow viewing AVAILABLE assets (so they can request them)
  // and assets currently assigned to them. Block everything else.
  let ownsAsset = false;
  let canRequestAsset = false;
  let hasPendingRequest = false;

  if (!isAdmin) {
    if (asset.status === "AVAILABLE") {
      // Employee can view available assets to request them.
      canRequestAsset = true;

      // Check if they already have a pending request for this asset.
      const employee = await prisma.employee.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
      if (employee) {
        const pending = await prisma.assetRequest.findFirst({
          where: {
            assetId: id,
            employeeId: employee.id,
            status: "PENDING",
          },
        });
        hasPendingRequest = !!pending;
      }
    } else {
      ownsAsset = await isAssetAssignedToUser(id, session.user.id);
      if (!ownsAsset) notFound();
    }
  }

  const assignableEmployees =
    isAdmin && asset.status === "AVAILABLE"
      ? (await getEmployees({ status: "ACTIVE" })).map((e) => ({
          id: e.id,
          name: e.name,
          department: e.department ?? "—",
        }))
      : [];

  const hardwareItems = isHardwareAsset(asset.type)
    ? [
        ...(asset.processor ? [{ label: "Processor", value: asset.processor }] : []),
        ...(asset.ram ? [{ label: "RAM", value: asset.ram }] : []),
        ...(asset.storage || asset.storageType
          ? [
              {
                label: "Storage",
                value: formatStorageSummary(asset.storage, asset.storageType) ?? "—",
              },
            ]
          : []),
      ]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={asset.name}
        description={`Tag: ${asset.assetTag}`}
        actions={
          isAdmin ? (
            <AssetActions
              assetId={asset.id}
              status={asset.status}
              assignableEmployees={assignableEmployees}
            />
          ) : ownsAsset && asset.status === "ASSIGNED" ? (
            <RequestReturnDialog assetId={asset.id} />
          ) : canRequestAsset && !hasPendingRequest ? (
            <RequestAssetDialog assetId={asset.id} />
          ) : canRequestAsset && hasPendingRequest ? (
            <span className="text-sm text-muted-foreground">
              Request pending review
            </span>
          ) : undefined
        }
      />

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

        {isHardwareAsset(asset.type) ? (
          <div className="mt-4 space-y-2 border-t border-border pt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Hardware Specifications
            </p>
            {hardwareItems.length > 0 ? (
              <InfoGrid items={hardwareItems} />
            ) : (
              <p className="text-sm text-muted-foreground">
                No hardware specifications recorded.
              </p>
            )}
          </div>
        ) : null}
      </div>

      {isAdmin ? (
        <AssetLocationForm assetId={asset.id} existingLocation={asset.location} />
      ) : (
        <AssetLocationCard location={asset.location} />
      )}

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
