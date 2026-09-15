import "server-only";

import { prisma } from "@/lib/prisma";
import type { AssetStatus } from "@/types/asset";
import type { AssignmentStatus } from "@/types/asset";

export interface AssignmentListItem {
  id: string;
  assetId: string;
  assetName: string;
  assetTag: string;
  assetType: string;
  assetStatus: AssetStatus;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  status: AssignmentStatus;
  assignedAt: Date;
  returnedAt: Date | null;
}

export interface AssignmentListFilters {
  status?: AssignmentStatus;
  search?: string;
}

export async function getAssignments(
  filters: AssignmentListFilters = {}
): Promise<AssignmentListItem[]> {
  const assignments = await prisma.assetAssignment.findMany({
    where: {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.search
        ? {
            OR: [
              {
                asset: {
                  name: { contains: filters.search, mode: "insensitive" },
                },
              },
              {
                asset: {
                  assetTag: { contains: filters.search, mode: "insensitive" },
                },
              },
              {
                employee: {
                  user: {
                    name: { contains: filters.search, mode: "insensitive" },
                  },
                },
              },
            ],
          }
        : {}),
    },
    orderBy: { assignedAt: "desc" },
    include: {
      asset: {
        select: { name: true, assetTag: true, type: true, status: true },
      },
      employee: {
        include: { user: { select: { name: true } } },
      },
    },
  });

  return assignments.map((a) => ({
    id: a.id,
    assetId: a.assetId,
    assetName: a.asset.name,
    assetTag: a.asset.assetTag,
    assetType: a.asset.type,
    assetStatus: a.asset.status,
    employeeId: a.employeeId,
    employeeName: a.employee.user.name,
    employeeCode: a.employee.employeeCode,
    department: a.employee.department,
    status: a.status,
    assignedAt: a.assignedAt,
    returnedAt: a.returnedAt,
  }));
}

export async function getAssignmentStats() {
  const [active, returned] = await Promise.all([
    prisma.assetAssignment.count({ where: { status: "ACTIVE" } }),
    prisma.assetAssignment.count({ where: { status: "RETURNED" } }),
  ]);
  return { active, returned, total: active + returned };
}
