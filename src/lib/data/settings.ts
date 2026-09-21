import "server-only";

import { prisma } from "@/lib/prisma";
import { isDemoAccountEmail } from "@/lib/demo";
import type { Role } from "@/types/role";

export interface SettingsData {
  account: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
  /** Credentials-based accounts can change their password; Google-only
   *  accounts (no passwordHash) cannot. */
  hasPassword: boolean;
  isDemoAccount: boolean;
}

export async function getSettingsData(userId: string): Promise<SettingsData | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, passwordHash: true },
  });
  if (!user) return null;

  return {
    account: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    hasPassword: user.passwordHash !== null,
    isDemoAccount: isDemoAccountEmail(user.email),
  };
}
