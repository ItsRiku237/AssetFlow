import "server-only";

import { prisma } from "@/lib/prisma";
import type { AssetStatus, ReturnRequestStatus } from "@/types/asset";

export interface AdminDashboardStats {
  totalAssets: number;
  available: number;
  assigned: number;
  inRepair: number;
  pendingReturnRequests: number;
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [totalAssets, available, assigned, inRepair, pendingReturnRequests] =
    await Promise.all([
      prisma.asset.count(),
      prisma.asset.count({ where: { status: "AVAILABLE" } }),
      prisma.asset.count({ where: { status: "ASSIGNED" } }),
      prisma.asset.count({ where: { status: "IN_REPAIR" } }),
      prisma.returnRequest.count({ where: { status: "PENDING" } }),
    ]);

  return { totalAssets, available, assigned, inRepair, pendingReturnRequests };
}

export interface RecentAssignmentItem {
  id: string;
  assetName: string;
  assetTag: string;
  employeeName: string;
  assignedAt: Date;
  returnedAt: Date | null;
}

/** Powers the "Recent Asset Activity" section — custody events. */
export async function getRecentAssignments(
  limit = 5
): Promise<RecentAssignmentItem[]> {
  const assignments = await prisma.assetAssignment.findMany({
    orderBy: { assignedAt: "desc" },
    take: limit,
    include: {
      asset: { select: { name: true, assetTag: true } },
      employee: { select: { name: true } },
    },
  });

  return assignments.map((a) => ({
    id: a.id,
    assetName: a.asset.name,
    assetTag: a.asset.assetTag,
    employeeName: a.employee.name,
    assignedAt: a.assignedAt,
    returnedAt: a.returnedAt,
  }));
}

export interface RecentReturnRequestItem {
  id: string;
  assetName: string;
  employeeName: string;
  status: ReturnRequestStatus;
  requestedAt: Date;
}

export async function getRecentReturnRequests(
  limit = 5
): Promise<RecentReturnRequestItem[]> {
  const requests = await prisma.returnRequest.findMany({
    orderBy: { requestedAt: "desc" },
    take: limit,
    include: {
      asset: { select: { name: true } },
      employee: { select: { name: true } },
    },
  });

  return requests.map((r) => ({
    id: r.id,
    assetName: r.asset.name,
    employeeName: r.employee.name,
    status: r.status,
    requestedAt: r.requestedAt,
  }));
}

export interface RecentMaintenanceItem {
  id: string;
  assetName: string;
  issue: string;
  startedAt: Date;
  completedAt: Date | null;
}

export async function getRecentMaintenanceActivity(
  limit = 5
): Promise<RecentMaintenanceItem[]> {
  const records = await prisma.maintenanceRecord.findMany({
    orderBy: { startedAt: "desc" },
    take: limit,
    include: { asset: { select: { name: true } } },
  });

  return records.map((m) => ({
    id: m.id,
    assetName: m.asset.name,
    issue: m.issue,
    startedAt: m.startedAt,
    completedAt: m.completedAt,
  }));
}

export interface RecentAuditItem {
  id: string;
  action: string;
  entityType: string;
  actorName: string | null;
  createdAt: Date;
}

export async function getRecentAuditActivity(
  limit = 5
): Promise<RecentAuditItem[]> {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { actor: { select: { name: true } } },
  });

  return logs.map((log) => ({
    id: log.id,
    action: log.action,
    entityType: log.entityType,
    actorName: log.actor?.name ?? null,
    createdAt: log.createdAt,
  }));
}

export interface MyAssignedAsset {
  id: string;
  assetName: string;
  assetTag: string;
  status: AssetStatus;
  assignedAt: Date;
}

export interface MyReturnRequest {
  id: string;
  assetName: string;
  status: ReturnRequestStatus;
  requestedAt: Date;
}

export interface MyRecentActivity {
  id: string;
  assetName: string;
  assignedAt: Date;
  returnedAt: Date | null;
}

export interface EmployeeDashboardData {
  assignedAssets: MyAssignedAsset[];
  pendingReturnRequests: MyReturnRequest[];
  recentActivity: MyRecentActivity[];
}

const EMPTY_EMPLOYEE_DASHBOARD: EmployeeDashboardData = {
  assignedAssets: [],
  pendingReturnRequests: [],
  recentActivity: [],
};

export async function getEmployeeDashboardData(
  userId: string
): Promise<EmployeeDashboardData> {
  const employee = await prisma.employee.findUnique({ where: { userId } });
  if (!employee) return EMPTY_EMPLOYEE_DASHBOARD;

  const [activeAssignments, pendingReturns, recentAssignments] =
    await Promise.all([
      prisma.assetAssignment.findMany({
        where: { employeeId: employee.id, status: "ACTIVE" },
        orderBy: { assignedAt: "desc" },
        include: { asset: { select: { name: true, assetTag: true, status: true } } },
      }),
      prisma.returnRequest.findMany({
        where: { employeeId: employee.id, status: "PENDING" },
        orderBy: { requestedAt: "desc" },
        include: { asset: { select: { name: true } } },
      }),
      prisma.assetAssignment.findMany({
        where: { employeeId: employee.id },
        orderBy: { assignedAt: "desc" },
        take: 5,
        include: { asset: { select: { name: true } } },
      }),
    ]);

  return {
    assignedAssets: activeAssignments.map((a) => ({
      id: a.id,
      assetName: a.asset.name,
      assetTag: a.asset.assetTag,
      status: a.asset.status,
      assignedAt: a.assignedAt,
    })),
    pendingReturnRequests: pendingReturns.map((r) => ({
      id: r.id,
      assetName: r.asset.name,
      status: r.status,
      requestedAt: r.requestedAt,
    })),
    recentActivity: recentAssignments.map((a) => ({
      id: a.id,
      assetName: a.asset.name,
      assignedAt: a.assignedAt,
      returnedAt: a.returnedAt,
    })),
  };
}
