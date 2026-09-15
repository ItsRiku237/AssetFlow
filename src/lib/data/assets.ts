import "server-only";

import { prisma } from "@/lib/prisma";
import type { AssetStatus } from "@/types/asset";
import type { ReturnRequestStatus } from "@/types/asset";
import type { MaintenanceRecordStatus } from "@/types/asset";

export interface AssetListFilters {
  search?: string;
  status?: AssetStatus;
  type?: string;
}

export interface AssetListItem {
  id: string;
  assetTag: string;
  name: string;
  type: string;
  model: string | null;
  serialNumber: string | null;
  status: AssetStatus;
  purchaseDate: Date | null;
  assignedEmployeeName: string | null;
}

export async function getAssets(
  filters: AssetListFilters
): Promise<AssetListItem[]> {
  const assets = await prisma.asset.findMany({
    where: {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.search
        ? {
            OR: [
              { name: { contains: filters.search, mode: "insensitive" } },
              { assetTag: { contains: filters.search, mode: "insensitive" } },
              {
                serialNumber: {
                  contains: filters.search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      assignments: {
        where: { status: "ACTIVE" },
        include: { employee: { include: { user: { select: { name: true } } } } },
      },
    },
  });

  return assets.map((a) => ({
    id: a.id,
    assetTag: a.assetTag,
    name: a.name,
    type: a.type,
    model: a.model,
    serialNumber: a.serialNumber,
    status: a.status,
    purchaseDate: a.purchaseDate,
    assignedEmployeeName: a.assignments[0]?.employee.user.name ?? null,
  }));
}

export async function getAssetTypes(): Promise<string[]> {
  const rows = await prisma.asset.findMany({
    distinct: ["type"],
    select: { type: true },
    orderBy: { type: "asc" },
  });
  return rows.map((r) => r.type);
}

export interface AssetDetail {
  id: string;
  assetTag: string;
  name: string;
  type: string;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  processor: string | null;
  ram: string | null;
  storage: string | null;
  purchaseDate: Date | null;
  purchasePrice: string | null;
  warrantyExpiry: Date | null;
  imageUrl: string | null;
  status: AssetStatus;
  createdAt: Date;
  updatedAt: Date;
  currentAssignment: {
    employeeId: string;
    employeeName: string;
    assignedAt: Date;
  } | null;
  assignmentHistory: {
    id: string;
    employeeName: string;
    assignedAt: Date;
    returnedAt: Date | null;
  }[];
  maintenanceRecords: {
    id: string;
    issue: string;
    description: string | null;
    vendor: string | null;
    cost: string | null;
    startedAt: Date;
    completedAt: Date | null;
    resolution: string | null;
    status: MaintenanceRecordStatus;
  }[];
  returnRequests: {
    id: string;
    status: ReturnRequestStatus;
    requestedAt: Date;
    employeeName: string;
  }[];
}

export async function getAssetById(id: string): Promise<AssetDetail | null> {
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      assignments: {
        orderBy: { assignedAt: "desc" },
        include: { employee: { include: { user: { select: { name: true } } } } },
      },
      maintenanceRecords: { orderBy: { startedAt: "desc" } },
      returnRequests: {
        orderBy: { requestedAt: "desc" },
        include: { employee: { include: { user: { select: { name: true } } } } },
      },
    },
  });
  if (!asset) return null;

  const active = asset.assignments.find((a) => a.status === "ACTIVE");

  return {
    id: asset.id,
    assetTag: asset.assetTag,
    name: asset.name,
    type: asset.type,
    brand: asset.brand,
    model: asset.model,
    serialNumber: asset.serialNumber,
    processor: asset.processor,
    ram: asset.ram,
    storage: asset.storage,
    purchaseDate: asset.purchaseDate,
    purchasePrice: asset.purchasePrice?.toString() ?? null,
    warrantyExpiry: asset.warrantyExpiry,
    imageUrl: asset.imageUrl,
    status: asset.status,
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt,
    currentAssignment: active
      ? {
          employeeId: active.employeeId,
          employeeName: active.employee.user.name,
          assignedAt: active.assignedAt,
        }
      : null,
    assignmentHistory: asset.assignments.map((a) => ({
      id: a.id,
      employeeName: a.employee.user.name,
      assignedAt: a.assignedAt,
      returnedAt: a.returnedAt,
    })),
    maintenanceRecords: asset.maintenanceRecords.map((m) => ({
      id: m.id,
      issue: m.issue,
      description: m.description,
      vendor: m.vendor,
      cost: m.cost?.toString() ?? null,
      startedAt: m.startedAt,
      completedAt: m.completedAt,
      resolution: m.resolution,
      status: (m.completedAt ? "COMPLETED" : "IN_PROGRESS") as MaintenanceRecordStatus,
    })),
    returnRequests: asset.returnRequests.map((r) => ({
      id: r.id,
      status: r.status,
      requestedAt: r.requestedAt,
      employeeName: r.employee.user.name,
    })),
  };
}

/** Used to enforce "employees may only view assets assigned to them". */
export async function isAssetAssignedToUser(
  assetId: string,
  userId: string
): Promise<boolean> {
  const employee = await prisma.employee.findUnique({ where: { userId } });
  if (!employee) return false;

  const activeAssignment = await prisma.assetAssignment.findFirst({
    where: { assetId, employeeId: employee.id, status: "ACTIVE" },
    select: { id: true },
  });
  return activeAssignment !== null;
}

export interface MyAssetListItem {
  id: string;
  assetTag: string;
  name: string;
  type: string;
  status: AssetStatus;
  assignedAt: Date;
}

export async function getMyAssets(userId: string): Promise<MyAssetListItem[]> {
  const employee = await prisma.employee.findUnique({ where: { userId } });
  if (!employee) return [];

  const assignments = await prisma.assetAssignment.findMany({
    where: { employeeId: employee.id, status: "ACTIVE" },
    orderBy: { assignedAt: "desc" },
    include: { asset: true },
  });

  return assignments.map((a) => ({
    id: a.asset.id,
    assetTag: a.asset.assetTag,
    name: a.asset.name,
    type: a.asset.type,
    status: a.asset.status,
    assignedAt: a.assignedAt,
  }));
}