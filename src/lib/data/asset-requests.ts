import "server-only";

import { prisma } from "@/lib/prisma";
import type { AssetRequestStatus } from "@/types/asset";

export interface AssetRequestListItem {
  id: string;
  assetId: string;
  assetName: string;
  assetTag: string;
  assetStatus: string;
  employeeId: string;
  employeeName: string;
  reason: string | null;
  status: AssetRequestStatus;
  reviewNote: string | null;
  requestedAt: Date;
  reviewedAt: Date | null;
  reviewedByName: string | null;
}

/** All asset requests — for admin view. Newest first. */
export async function getAssetRequests(
  filters: { status?: AssetRequestStatus } = {}
): Promise<AssetRequestListItem[]> {
  const rows = await prisma.assetRequest.findMany({
    where: filters.status ? { status: filters.status } : {},
    orderBy: { requestedAt: "desc" },
    include: {
      asset: { select: { name: true, assetTag: true, status: true } },
      employee: { select: { name: true } },
      reviewedBy: { select: { name: true } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    assetId: r.assetId,
    assetName: r.asset.name,
    assetTag: r.asset.assetTag,
    assetStatus: r.asset.status,
    employeeId: r.employeeId,
    employeeName: r.employee.name,
    reason: r.reason,
    status: r.status as AssetRequestStatus,
    reviewNote: r.reviewNote,
    requestedAt: r.requestedAt,
    reviewedAt: r.reviewedAt,
    reviewedByName: r.reviewedBy?.name ?? null,
  }));
}

export interface MyAssetRequestItem {
  id: string;
  assetId: string;
  assetName: string;
  assetTag: string;
  assetType: string;
  reason: string | null;
  status: AssetRequestStatus;
  reviewNote: string | null;
  requestedAt: Date;
  reviewedAt: Date | null;
}

/** Asset requests belonging to a specific employee (by userId). */
export async function getMyAssetRequests(
  userId: string
): Promise<MyAssetRequestItem[]> {
  const employee = await prisma.employee.findUnique({ where: { userId } });
  if (!employee) return [];

  const rows = await prisma.assetRequest.findMany({
    where: { employeeId: employee.id },
    orderBy: { requestedAt: "desc" },
    include: {
      asset: { select: { name: true, assetTag: true, type: true } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    assetId: r.assetId,
    assetName: r.asset.name,
    assetTag: r.asset.assetTag,
    assetType: r.asset.type,
    reason: r.reason,
    status: r.status as AssetRequestStatus,
    reviewNote: r.reviewNote,
    requestedAt: r.requestedAt,
    reviewedAt: r.reviewedAt,
  }));
}

/**
 * Assets an employee may request: AVAILABLE status only.
 * Excludes assets the employee already has an active assignment for,
 * and assets they already have a PENDING request for.
 */
export async function getRequestableAssets(userId: string) {
  const employee = await prisma.employee.findUnique({ where: { userId } });
  if (!employee) return [];

  // Asset IDs the employee currently holds.
  const heldAssetIds = await prisma.assetAssignment
    .findMany({
      where: { employeeId: employee.id, status: "ACTIVE" },
      select: { assetId: true },
    })
    .then((rows) => rows.map((r) => r.assetId));

  // Asset IDs the employee has already requested (PENDING).
  const pendingAssetIds = await prisma.assetRequest
    .findMany({
      where: { employeeId: employee.id, status: "PENDING" },
      select: { assetId: true },
    })
    .then((rows) => rows.map((r) => r.assetId));

  const excluded = Array.from(new Set([...heldAssetIds, ...pendingAssetIds]));

  return prisma.asset.findMany({
    where: {
      status: "AVAILABLE",
      id: excluded.length > 0 ? { notIn: excluded } : undefined,
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      assetTag: true,
      type: true,
      brand: true,
      model: true,
      status: true,
    },
  });
}
