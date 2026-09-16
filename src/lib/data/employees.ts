import "server-only";

import { prisma } from "@/lib/prisma";
import type { AssetStatus } from "@/types/asset";
import type { EmployeeStatus } from "@/types/employee";
import type { Role } from "@/types/role";

export interface EmployeeListFilters {
  search?: string;
  department?: string;
  status?: EmployeeStatus;
}

export interface EmployeeListItem {
  id: string;
  employeeCode: string;
  name: string;
  email: string | null;
  department: string | null;
  designation: string | null;
  status: EmployeeStatus;
  /** Whether this directory record has a linked login account. */
  accountLinked: boolean;
  role: Role | null;
  createdAt: Date;
  assignedAssetCount: number;
}

export async function getEmployees(
  filters: EmployeeListFilters = {}
): Promise<EmployeeListItem[]> {
  const employees = await prisma.employee.findMany({
    where: {
      ...(filters.department ? { department: filters.department } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.search
        ? {
            OR: [
              {
                employeeCode: { contains: filters.search, mode: "insensitive" },
              },
              { name: { contains: filters.search, mode: "insensitive" } },
              { email: { contains: filters.search, mode: "insensitive" } },
              {
                department: { contains: filters.search, mode: "insensitive" },
              },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
    include: {
      user: { select: { role: true } },
      _count: {
        select: { assignments: { where: { status: "ACTIVE" } } },
      },
    },
  });

  return employees.map((e) => ({
    id: e.id,
    employeeCode: e.employeeCode,
    name: e.name,
    email: e.email,
    department: e.department,
    designation: e.designation,
    status: e.status,
    accountLinked: e.userId !== null,
    role: e.user?.role ?? null,
    createdAt: e.createdAt,
    assignedAssetCount: e._count.assignments,
  }));
}

export async function getDepartments(): Promise<string[]> {
  const rows = await prisma.employee.findMany({
    where: { department: { not: null } },
    distinct: ["department"],
    select: { department: true },
    orderBy: { department: "asc" },
  });
  return rows
    .map((r) => r.department)
    .filter((d): d is string => Boolean(d));
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
  employeeCode: string;
  name: string;
  email: string | null;
  department: string | null;
  designation: string | null;
  phone: string | null;
  status: EmployeeStatus;
  createdAt: Date;
  /** Login-account details, present only when this directory record is linked. */
  account: {
    email: string;
    image: string | null;
    role: Role;
  } | null;
  assignedAssets: EmployeeAssignedAsset[];
}

export async function getEmployeeById(
  id: string
): Promise<EmployeeDetail | null> {
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, image: true, role: true } },
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
    employeeCode: employee.employeeCode,
    name: employee.name,
    email: employee.email,
    department: employee.department,
    designation: employee.designation,
    phone: employee.phone,
    status: employee.status,
    createdAt: employee.createdAt,
    account: employee.user
      ? {
          email: employee.user.email,
          image: employee.user.image,
          role: employee.user.role,
        }
      : null,
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

/** Used by the Add/Edit Employee forms to check Employee ID uniqueness. */
export async function getEmployeeByCode(employeeCode: string) {
  return prisma.employee.findUnique({
    where: { employeeCode },
    select: { id: true },
  });
}
