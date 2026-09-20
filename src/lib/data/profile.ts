import "server-only";

import { prisma } from "@/lib/prisma";
import type { AssetStatus, ReturnRequestStatus } from "@/types/asset";
import type { EmployeeStatus } from "@/types/employee";
import type { Role } from "@/types/role";

export interface ProfileAssignedAsset {
  id: string;
  assetId: string;
  assetName: string;
  assetTag: string;
  type: string;
  brand: string | null;
  model: string | null;
  status: AssetStatus;
  assignedAt: Date;
}

export interface ProfileReturnRequest {
  id: string;
  assetId: string;
  assetName: string;
  assetTag: string;
  reason: string;
  status: ReturnRequestStatus;
  requestedAt: Date;
}

export interface ProfileCustodyHistoryItem {
  id: string;
  assetId: string;
  assetName: string;
  assetTag: string;
  assignedAt: Date;
  returnedAt: Date | null;
}

export interface EmployeeProfileData {
  account: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: Role;
    createdAt: Date;
  };
  employee: {
    id: string;
    employeeCode: string;
    name: string;
    email: string | null;
    department: string | null;
    designation: string | null;
    phone: string | null;
    status: EmployeeStatus;
    createdAt: Date;
  } | null;
  assignedAssets: ProfileAssignedAsset[];
  pendingReturnRequests: ProfileReturnRequest[];
  custodyHistory: ProfileCustodyHistoryItem[];
}

export async function getEmployeeProfile(
  userId: string,
  userEmail?: string | null
): Promise<EmployeeProfileData | null> {
  let user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
      employee: {
        include: {
          assignments: {
            orderBy: { assignedAt: "desc" },
            include: {
              asset: {
                select: {
                  id: true,
                  name: true,
                  assetTag: true,
                  type: true,
                  brand: true,
                  model: true,
                  status: true,
                },
              },
            },
          },
          returnRequests: {
            where: { status: "PENDING" },
            orderBy: { requestedAt: "desc" },
            include: {
              asset: {
                select: {
                  name: true,
                  assetTag: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // Fallback: if id lookup missed (e.g. stale JWT id after account recreation),
  // retry by email so authenticated admins never hit a spurious 404.
  if (!user && userEmail) {
    user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        employee: {
          include: {
            assignments: {
              orderBy: { assignedAt: "desc" },
              include: {
                asset: {
                  select: {
                    id: true,
                    name: true,
                    assetTag: true,
                    type: true,
                    brand: true,
                    model: true,
                    status: true,
                  },
                },
              },
            },
            returnRequests: {
              where: { status: "PENDING" },
              orderBy: { requestedAt: "desc" },
              include: {
                asset: {
                  select: {
                    name: true,
                    assetTag: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  if (!user) return null;

  const employee = user.employee;
  const activeAssignments = employee
    ? employee.assignments.filter((a) => a.status === "ACTIVE")
    : [];

  return {
    account: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      createdAt: user.createdAt,
    },
    employee: employee
      ? {
          id: employee.id,
          employeeCode: employee.employeeCode,
          name: employee.name,
          email: employee.email,
          department: employee.department,
          designation: employee.designation,
          phone: employee.phone,
          status: employee.status,
          createdAt: employee.createdAt,
        }
      : null,
    assignedAssets: activeAssignments.map((a) => ({
      id: a.id,
      assetId: a.asset.id,
      assetName: a.asset.name,
      assetTag: a.asset.assetTag,
      type: a.asset.type,
      brand: a.asset.brand,
      model: a.asset.model,
      status: a.asset.status,
      assignedAt: a.assignedAt,
    })),
    pendingReturnRequests: (employee?.returnRequests ?? []).map((r) => ({
      id: r.id,
      assetId: r.assetId,
      assetName: r.asset.name,
      assetTag: r.asset.assetTag,
      reason: r.reason,
      status: r.status,
      requestedAt: r.requestedAt,
    })),
    custodyHistory: (employee?.assignments ?? []).slice(0, 5).map((a) => ({
      id: a.id,
      assetId: a.asset.id,
      assetName: a.asset.name,
      assetTag: a.asset.assetTag,
      assignedAt: a.assignedAt,
      returnedAt: a.returnedAt,
    })),
  };
}
