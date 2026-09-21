import "server-only";

import { prisma } from "@/lib/prisma";
import type { ReimbursementStatus } from "@/types/asset";

export interface ReimbursementListItem {
  id: string;
  assetId: string;
  assetName: string;
  assetTag: string;
  employeeId: string;
  employeeName: string;
  maintenanceRecordId: string | null;
  maintenanceIssue: string | null;
  amount: string;
  description: string;
  receiptReference: string | null;
  status: ReimbursementStatus;
  submittedAt: Date;
  reviewedAt: Date | null;
  reviewedByName: string | null;
  rejectionReason: string | null;
}

/** All reimbursement requests — for admin view. Newest first. */
export async function getReimbursements(
  filters: { status?: ReimbursementStatus } = {}
): Promise<ReimbursementListItem[]> {
  const rows = await prisma.reimbursement.findMany({
    where: filters.status ? { status: filters.status } : {},
    orderBy: { submittedAt: "desc" },
    include: {
      asset: { select: { name: true, assetTag: true } },
      employee: { select: { name: true } },
      maintenanceRecord: { select: { issue: true } },
      reviewedBy: { select: { name: true } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    assetId: r.assetId,
    assetName: r.asset.name,
    assetTag: r.asset.assetTag,
    employeeId: r.employeeId,
    employeeName: r.employee.name,
    maintenanceRecordId: r.maintenanceRecordId,
    maintenanceIssue: r.maintenanceRecord?.issue ?? null,
    amount: r.amount.toString(),
    description: r.description,
    receiptReference: r.receiptReference,
    status: r.status as ReimbursementStatus,
    submittedAt: r.submittedAt,
    reviewedAt: r.reviewedAt,
    reviewedByName: r.reviewedBy?.name ?? null,
    rejectionReason: r.rejectionReason,
  }));
}

export interface MyReimbursementItem {
  id: string;
  assetId: string;
  assetName: string;
  assetTag: string;
  maintenanceRecordId: string | null;
  maintenanceIssue: string | null;
  amount: string;
  description: string;
  receiptReference: string | null;
  status: ReimbursementStatus;
  submittedAt: Date;
  reviewedAt: Date | null;
  rejectionReason: string | null;
}

/** Reimbursements for a specific employee (by userId). */
export async function getMyReimbursements(
  userId: string
): Promise<MyReimbursementItem[]> {
  const employee = await prisma.employee.findUnique({ where: { userId } });
  if (!employee) return [];

  const rows = await prisma.reimbursement.findMany({
    where: { employeeId: employee.id },
    orderBy: { submittedAt: "desc" },
    include: {
      asset: { select: { name: true, assetTag: true } },
      maintenanceRecord: { select: { issue: true } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    assetId: r.assetId,
    assetName: r.asset.name,
    assetTag: r.asset.assetTag,
    maintenanceRecordId: r.maintenanceRecordId,
    maintenanceIssue: r.maintenanceRecord?.issue ?? null,
    amount: r.amount.toString(),
    description: r.description,
    receiptReference: r.receiptReference,
    status: r.status as ReimbursementStatus,
    submittedAt: r.submittedAt,
    reviewedAt: r.reviewedAt,
    rejectionReason: r.rejectionReason,
  }));
}

/**
 * Assets with a completed maintenance record, where the employee has
 * (or had) an active assignment — eligible for reimbursement submission.
 */
export async function getReimbursableAssets(userId: string) {
  const employee = await prisma.employee.findUnique({ where: { userId } });
  if (!employee) return [];

  // Assets this employee was ever assigned (active or returned).
  const assignedAssetIds = await prisma.assetAssignment
    .findMany({
      where: { employeeId: employee.id },
      select: { assetId: true },
    })
    .then((rows) => rows.map((r) => r.assetId));

  if (assignedAssetIds.length === 0) return [];

  return prisma.asset.findMany({
    where: { id: { in: assignedAssetIds } },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      assetTag: true,
      type: true,
    },
  });
}

/**
 * Maintenance records for a given asset, so the employee can link one.
 */
export async function getMaintenanceRecordsForAsset(assetId: string) {
  return prisma.maintenanceRecord.findMany({
    where: { assetId },
    orderBy: { startedAt: "desc" },
    select: {
      id: true,
      issue: true,
      startedAt: true,
      completedAt: true,
    },
  });
}
