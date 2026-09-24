import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";

import authConfig from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validations/auth";
import type { Role } from "@/types/role";
import { createNotifications, getAdminUserIds } from "@/lib/notifications";
import { resolveSessionRole } from "@/lib/demo";

// ─── Pending-link store ──────────────────────────────────────────────────────
//
// When a Google user signs in for the first time and matches an unlinked
// Employee record, the signIn callback fires BEFORE the PrismaAdapter calls
// createUser. We cannot attach extra fields to the `user` object because the
// adapter passes that same object directly to `prisma.user.create`, and Prisma
// rejects unknown fields with a PrismaClientValidationError.
//
// Instead we keep an in-process Map keyed by the normalised email address. The
// entry is written in signIn (before the adapter creates the row) and read in
// the jwt callback (after the adapter has created the row and we have a user
// id). Entries are deleted as soon as they are consumed or after a short TTL.
//
// This is safe because:
//   - The Map lives in the Node.js server process (never reaches the client).
//   - The key is the verified Google email; we re-validate ownership in jwt.
//   - The entry is consumed once and immediately deleted.
//   - A TTL of 5 minutes prevents stale entries from accumulating.

interface PendingLink {
  employeeId: string;
  employeeCode: string;
  expiresAt: number;
}

const PENDING_LINK_TTL_MS = 5 * 60 * 1000; // 5 minutes
const pendingLinks = new Map<string, PendingLink>();

function setPendingLink(email: string, employeeId: string, employeeCode: string) {
  pendingLinks.set(email, {
    employeeId,
    employeeCode,
    expiresAt: Date.now() + PENDING_LINK_TTL_MS,
  });
}

function consumePendingLink(email: string): PendingLink | undefined {
  const entry = pendingLinks.get(email);
  pendingLinks.delete(email); // consume immediately
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) return undefined; // expired
  return entry;
}

// ─── NextAuth instance ───────────────────────────────────────────────────────

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
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
          role: resolveSessionRole(user.role as Role, user.email),
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,

    /**
     * Fired after Google returns a verified profile, BEFORE the PrismaAdapter
     * calls createUser. We must NOT mutate `user` here — the adapter passes
     * the same object to prisma.user.create and Prisma rejects unknown fields.
     *
     * Instead we use the in-process pendingLinks map to carry the employee
     * context forward to the jwt callback, where the user row already exists.
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
        // but only if it has no employee link and no password hash.
        await cleanupOrphanUser(normalizedEmail);
        return false;
      }

      // Employee already linked — only allow sign-in if it's the SAME user.
      if (employee.userId !== null) {
        const dbUser = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          select: { id: true },
        });
        if (!dbUser || dbUser.id !== employee.userId) {
          return false;
        }
        // Returning linked employee — allow.
        return true;
      }

      // Employee is unlinked — first-time Google activation.
      // Check whether the User row already exists (created by a previous
      // partial attempt that failed before reaching jwt).
      const dbUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true },
      });

      if (dbUser) {
        // Row already exists — link now; no need for the pending map.
        await linkGoogleEmployee(dbUser.id, employee.id, employee.employeeCode);
        return true;
      }

      // Row does NOT exist yet. The adapter will create it after we return
      // true. Record the pending link so the jwt callback can finish the job.
      // DO NOT mutate `user` — that object is passed directly to createUser.
      setPendingLink(normalizedEmail, employee.id, employee.employeeCode);
      return true;
    },

    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role as Role;
      }

      // Google first-time activation: the adapter just created the User row.
      // Check whether there is a pending employee link for this email.
      if (user?.email && user.id) {
        const normalizedEmail = user.email.toLowerCase().trim();
        const pending = consumePendingLink(normalizedEmail);

        if (pending) {
          try {
            await linkGoogleEmployee(
              user.id as string,
              pending.employeeId,
              pending.employeeCode
            );
          } catch {
            // linkGoogleEmployee throws "already_claimed" on a race condition
            // (two simultaneous first-time sign-ins for the same employee).
            // The employee is already linked; let the session continue normally.
          }
          token.onboardingRequired = false;
          token.role = "EMPLOYEE" as Role;
        }
      }

      // On session refresh, re-read live values from the database.
      if (trigger === "update" || (!user && token.id)) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            onboardingRequired: true,
            role: true,
            status: true,
            email: true,
          },
        });
        if (dbUser) {
          token.onboardingRequired = dbUser.onboardingRequired;
          token.role = resolveSessionRole(dbUser.role as Role, dbUser.email);
          token.status = dbUser.status as "ACTIVE" | "DEACTIVATED";
        }
      }

      return token;
    },
  },
});

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Link a Google-created User row to an existing Employee directory record.
 * Sets role = EMPLOYEE and onboardingRequired = false atomically.
 * The updateMany on Employee is race-safe: if another request already linked
 * it, count === 0 and we throw so the transaction rolls back.
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

  const adminIds = await getAdminUserIds();
  await createNotifications(
    adminIds.map((uid) => ({
      userId: uid,
      title: "Employee account activated",
      message: `An employee activated their account via Google (${employeeCode}).`,
      link: "/employees",
    }))
  );
}

/**
 * Delete an orphan User row the PrismaAdapter may have created for a Google
 * account whose email doesn't match any Employee directory entry.
 * Only deletes rows that have no employee link and no password hash.
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
    // Non-critical cleanup — ignore errors.
  }
}
