import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";

import authConfig from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validations/auth";
import type { Role } from "@/types/role";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  providers: [
    Google,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,

    /**
     * Fired after every successful OAuth sign-in (credentials bypass this —
     * they can only reach here if authorize() returned a user).
     *
     * Google sign-in is allowed ONLY when the verified Google email
     * exactly matches an existing ACTIVE, unlinked Employee directory record.
     * Everything else is rejected here — before the session is issued.
     */
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;

      if (!user.email) return false;

      const normalizedEmail = user.email.toLowerCase().trim();

      // Find a matching employee in the directory.
      const employee = await prisma.employee.findFirst({
        where: {
          email: { equals: normalizedEmail, mode: "insensitive" },
          status: "ACTIVE",
        },
        select: { id: true, userId: true, employeeCode: true },
      });

      // Reject if no matching ACTIVE employee in directory.
      if (!employee) {
        // Clean up any orphan user the adapter may have just created,
        // but only if it has no employee link (i.e. it's truly orphaned).
        await cleanupOrphanUser(normalizedEmail);
        return false;
      }

      // Check whether this employee already has a linked account.
      if (employee.userId !== null) {
        // Employee already linked — only allow sign-in if it's the SAME user.
        // (i.e. they're logging back in with Google, not a second account.)
        const dbUser = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          select: { id: true },
        });
        if (!dbUser || dbUser.id !== employee.userId) {
          return false;
        }
        // Returning linked employee — fine.
        return true;
      }

      // Employee is unlinked — this is a first-time Google activation.
      // The adapter will create (or has just created) the User row.
      // We need to link it and set onboardingRequired = false, role = EMPLOYEE.
      const dbUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true },
      });

      if (!dbUser) {
        // Adapter hasn't created the row yet — flag it for the jwt callback.
        (user as unknown as Record<string, unknown>).__employeeId = employee.id;
        (user as unknown as Record<string, unknown>).__employeeCode = employee.employeeCode;
        return true;
      }

      // Link in a race-safe transaction.
      await linkGoogleEmployee(dbUser.id, employee.id, employee.employeeCode);
      return true;
    },

    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role as Role;
      }

      // Google first-time activation: adapter just created the row.
      const meta = user as unknown as Record<string, unknown> | undefined;
      const pendingEmployeeId = meta?.__employeeId as string | undefined;
      const pendingEmployeeCode = meta?.__employeeCode as string | undefined;

      if (pendingEmployeeId && user?.id) {
        await linkGoogleEmployee(user.id as string, pendingEmployeeId, pendingEmployeeCode ?? "");
        token.onboardingRequired = false;
        token.role = "EMPLOYEE" as Role;
      }

      // On session refresh, re-read live values.
      if (trigger === "update" || (!user && token.id)) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { onboardingRequired: true, role: true },
        });
        if (dbUser) {
          token.onboardingRequired = dbUser.onboardingRequired;
          token.role = dbUser.role as Role;
        }
      }

      return token;
    },
  },
});

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Link a newly-created Google User to an existing Employee directory record.
 * Sets role = EMPLOYEE, onboardingRequired = false.
 * Uses updateMany for the Employee side to be race-safe.
 */
async function linkGoogleEmployee(
  userId: string,
  employeeId: string,
  employeeCode: string
) {
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { role: "EMPLOYEE", onboardingRequired: false },
    });

    const linked = await tx.employee.updateMany({
      where: { id: employeeId, userId: null },
      data: { userId },
    });

    if (linked.count === 0) {
      // Race condition or already linked — roll back.
      throw new Error("already_claimed");
    }

    await tx.auditLog.create({
      data: {
        actorId: userId,
        action: "EMPLOYEE_ACCOUNT_CREATED",
        entityType: "Employee",
        entityId: employeeId,
        metadata: { employeeCode, provider: "google", userId },
      },
    });
  });
}

/**
 * Delete an orphan User row that the PrismaAdapter may have created for
 * a Google account whose email doesn't match any Employee directory entry.
 * Only deletes the row if it has no employee link and no password hash
 * (i.e. it was just auto-created by the adapter, not a real account).
 */
async function cleanupOrphanUser(email: string) {
  try {
    const u = await prisma.user.findUnique({
      where: { email },
      select: { id: true, passwordHash: true, employee: { select: { id: true } } },
    });
    if (u && !u.passwordHash && !u.employee) {
      await prisma.user.delete({ where: { id: u.id } });
    }
  } catch {
    // Non-critical — ignore any cleanup error.
  }
}
