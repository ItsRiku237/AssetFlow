import "server-only";

import { prisma } from "@/lib/prisma";
import type { MaintenanceRecordStatus } from "@/types/asset";

/**
 * Assets whose asset.status is IN_REPAIR, along with their currently
 * active (not yet completed) maintenance record, if one has been
 * logged. An asset can be IN_REPAIR without an active record yet —
 * that happens right after a return request is approved into repair
 * (see approveReturnRequest in return-request-actions.ts) and before
 * an admin has logged what's actually wrong.
 */
export interface AssetInRepairItem {
  id: string;
  assetTag: string;
  name: string;
  type: string;
  activeMaintenanceRecordId: string | null;
  activeIssue: string | null;
  activeDescription: string | null;
  activeVendor: string | null;
  activeCost: string | null;
  repairStartedAt: Date | null;
}

export async function getAssetsInRepair(): Promise<AssetInRepairItem[]> {
  const assets = await prisma.asset.findMany({
    where: { status: "IN_REPAIR" },
    orderBy: { updatedAt: "desc" },
    include: {
      maintenanceRecords: {
        where: { completedAt: null },
        orderBy: { startedAt: "desc" },
        take: 1,
      },
    },
  });

  return assets.map((asset) => {
    const active = asset.maintenanceRecords[0] ?? null;
    return {
      id: asset.id,
      assetTag: asset.assetTag,
      name: asset.name,
      type: asset.type,
      activeMaintenanceRecordId: active?.id ?? null,
      activeIssue: active?.issue ?? null,
      activeDescription: active?.description ?? null,
      activeVendor: active?.vendor ?? null,
      activeCost: active?.cost?.toString() ?? null,
      repairStartedAt: active?.startedAt ?? null,
    };
  });
}

export interface MaintenanceHistoryItem {
  id: string;
  assetId: string;
  assetName: string;
  assetTag: string;
  issue: string;
  description: string | null;
  vendor: string | null;
  cost: string | null;
  startedAt: Date;
  completedAt: Date | null;
  resolution: string | null;
  status: MaintenanceRecordStatus;
}

export async function getMaintenanceHistory(): Promise<
  MaintenanceHistoryItem[]
> {
  const records = await prisma.maintenanceRecord.findMany({
    orderBy: { startedAt: "desc" },
    include: { asset: { select: { id: true, name: true, assetTag: true } } },
  });

  return records.map((record) => ({
    id: record.id,
    assetId: record.asset.id,
    assetName: record.asset.name,
    assetTag: record.asset.assetTag,
    issue: record.issue,
    description: record.description,
    vendor: record.vendor,
    cost: record.cost?.toString() ?? null,
    startedAt: record.startedAt,
    completedAt: record.completedAt,
    resolution: record.resolution,
    status: record.completedAt ? "COMPLETED" : "IN_PROGRESS",
  }));
}

/** The one active (not yet completed) maintenance record for an asset, if any. */
export async function getActiveMaintenanceRecord(assetId: string) {
  return prisma.maintenanceRecord.findFirst({
    where: { assetId, completedAt: null },
    orderBy: { startedAt: "desc" },
  });
}
