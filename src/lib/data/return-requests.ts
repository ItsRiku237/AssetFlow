import "server-only";

import { prisma } from "@/lib/prisma";
import type { ReturnRequestStatus } from "@/types/asset";

export interface ReturnRequestListItem {
  id: string;
  assetId: string;
  assetName: string;
  assetTag: string;
  employeeName: string;
  reason: string;
  status: ReturnRequestStatus;
  requestedAt: Date;
  reviewedAt: Date | null;
  reviewedByName: string | null;
}

export async function getReturnRequests(
  filters: { status?: ReturnRequestStatus } = {}
): Promise<ReturnRequestListItem[]> {
  const requests = await prisma.returnRequest.findMany({
    where: filters.status ? { status: filters.status } : {},
    orderBy: { requestedAt: "desc" },
    include: {
      asset: { select: { name: true, assetTag: true } },
      employee: { select: { name: true } },
      reviewedBy: { select: { name: true } },
    },
  });

  return requests.map((r) => ({
    id: r.id,
    assetId: r.assetId,
    assetName: r.asset.name,
    assetTag: r.asset.assetTag,
    employeeName: r.employee.name,
    reason: r.reason,
    status: r.status,
    requestedAt: r.requestedAt,
    reviewedAt: r.reviewedAt,
    reviewedByName: r.reviewedBy?.name ?? null,
  }));
}

export interface MyReturnRequestItem {
  id: string;
  assetId: string;
  assetName: string;
  assetTag: string;
  reason: string;
  status: ReturnRequestStatus;
  requestedAt: Date;
  reviewedAt: Date | null;
}

export async function getMyReturnRequests(
  userId: string
): Promise<MyReturnRequestItem[]> {
  const employee = await prisma.employee.findUnique({ where: { userId } });
  if (!employee) return [];

  const requests = await prisma.returnRequest.findMany({
    where: { employeeId: employee.id },
    orderBy: { requestedAt: "desc" },
    include: { asset: { select: { name: true, assetTag: true } } },
  });

  return requests.map((r) => ({
    id: r.id,
    assetId: r.assetId,
    assetName: r.asset.name,
    assetTag: r.asset.assetTag,
    reason: r.reason,
    status: r.status,
    requestedAt: r.requestedAt,
    reviewedAt: r.reviewedAt,
  }));
}
