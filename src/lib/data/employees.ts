import "server-only";

import { prisma } from "@/lib/prisma";
import type { AssetStatus } from "@/types/asset";
import type { Role } from "@/types/role";

export interface EmployeeListFilters {
  search?: string;
  department?: string;
}

export interface EmployeeListItem {
  id: string;
  name: string;
  email: string;
  employeeCode: string;
  department: string;
  designation: string;
  role: Role;
  joinedAt: Date;
  assignedAssetCount: number;
}

export async function getEmployees(
  filters: EmployeeListFilters
): Promise<EmployeeListItem[]> {
  const employees = await prisma.employee.findMany({
    where: {
      ...(filters.department ? { department: filters.department } : {}),
      ...(filters.search
        ? {
            OR: [
              {
                employeeCode: { contains: filters.search, mode: "insensitive" },
              },
              {
                user: {
                  name: { contains: filters.search, mode: "insensitive" },
                },
              },
              {
                user: {
                  email: { contains: filters.search, mode: "insensitive" },
                },
              },
            ],
          }
        : {}),
    },
    orderBy: { user: { name: "asc" } },
    include: {
      user: true,
      _count: {
        select: { assignments: { where: { status: "ACTIVE" } } },
      },
    },
  });

  return employees.map((e) => ({
    id: e.id,
    name: e.user.name,
    email: e.user.email,
    employeeCode: e.employeeCode,
    department: e.department,
    designation: e.designation,
    role: e.user.role,
    joinedAt: e.user.createdAt,
    assignedAssetCount: e._count.assignments,
  }));
}

export async function getDepartments(): Promise<string[]> {
  const rows = await prisma.employee.findMany({
    distinct: ["department"],
    select: { department: true },
    orderBy: { department: "asc" },
  });
  return rows.map((r) => r.department);
}

export interface EmployeeAssignedAsset {
  id: string;
  assetId: string;
  assetName: string;
  assetTag: string;
  status: AssetStatus;
  assignedAt: Date;
}

export interface EmployeeDetail {
  id: string;
  name: string;
  email: string;
  image: string | null;
  employeeCode: string;
  department: string;
  designation: string;
  phone: string | null;
  role: Role;
  joinedAt: Date;
  assignedAssets: EmployeeAssignedAsset[];
}

export async function getEmployeeById(
  id: string
): Promise<EmployeeDetail | null> {
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      user: true,
      assignments: {
        where: { status: "ACTIVE" },
        orderBy: { assignedAt: "desc" },
        include: { asset: true },
      },
    },
  });
  if (!employee) return null;

  return {
    id: employee.id,
    name: employee.user.name,
    email: employee.user.email,
    image: employee.user.image,
    employeeCode: employee.employeeCode,
    department: employee.department,
    designation: employee.designation,
    phone: employee.phone,
    role: employee.user.role,
    joinedAt: employee.user.createdAt,
    assignedAssets: employee.assignments.map((a) => ({
      id: a.id,
      assetId: a.asset.id,
      assetName: a.asset.name,
      assetTag: a.asset.assetTag,
      status: a.asset.status,
      assignedAt: a.assignedAt,
    })),
  };
}
