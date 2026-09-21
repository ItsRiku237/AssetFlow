import "server-only";

import { prisma } from "@/lib/prisma";
import {
  DEMO_ADMIN_EMAIL_PREFIX,
  DEMO_ADMIN_EMAIL_SUFFIX,
  resolveSessionRole,
} from "@/lib/demo";
import type { Role } from "@/types/role";

export interface AdminListItem {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** Dashboard access is blocked when status = DEACTIVATED. */
  active: boolean;
  createdAt: Date;
  image: string | null;
}

/**
 * Return all ADMIN and SUPER_ADMIN users, ordered by creation date.
 * Used by the /admins page (SUPER_ADMIN only).
 *
 * `demoOnly` restricts the list to accounts inside the demo admin scope,
 * so a demo session never sees real administrator accounts.
 */
export async function getAdmins(
  options: { demoOnly?: boolean } = {}
): Promise<AdminListItem[]> {
  const users = await prisma.user.findMany({
    where: {
      role: { in: ["ADMIN", "SUPER_ADMIN"] },
      ...(options.demoOnly
        ? {
            email: {
              startsWith: DEMO_ADMIN_EMAIL_PREFIX,
              endsWith: DEMO_ADMIN_EMAIL_SUFFIX,
            },
          }
        : {}),
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      image: true,
    },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: resolveSessionRole(u.role as Role, u.email),
    active: u.status === "ACTIVE",
    createdAt: u.createdAt,
    image: u.image,
  }));
}

/**
 * Count active SUPER_ADMINs (status = ACTIVE).
 * Used to enforce the last-super-admin protection.
 */
export async function countActiveSuperAdmins(): Promise<number> {
  return prisma.user.count({
    where: { role: "SUPER_ADMIN", status: "ACTIVE" },
  });
}
