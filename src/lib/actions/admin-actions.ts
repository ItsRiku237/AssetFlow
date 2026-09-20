"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { requireSuperAdmin } from "@/lib/auth-guards";
import { recordAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { sendAdminInviteEmail } from "@/lib/email";
import {
  inviteAdminSchema,
  type InviteAdminActionState,
} from "@/lib/validations/admin";

export type { InviteAdminActionState };
export type AdminActionState = { error: string | null; success?: boolean };

/**
 * Email of the protected system owner account.
 * This account must never be deactivated or modified through admin-management UI.
 */
const PROTECTED_ADMIN_EMAIL = "admin@assetflow.dev";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Generate a random temporary password (16 chars, URL-safe characters). */
function generateTemporaryPassword(): string {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*";
  let result = "";
  // Use Math.random — this is a one-time invitation password that the
  // admin must change on first sign-in. Not a security-critical secret.
  for (let i = 0; i < 16; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// ─── Invite Admin ────────────────────────────────────────────────────────────

/**
 * Create a new ADMIN account and email them a temporary password.
 * Only SUPER_ADMIN may call this.
 */
export async function inviteAdmin(
  _prevState: InviteAdminActionState,
  formData: FormData
): Promise<InviteAdminActionState> {
  const session = await requireSuperAdmin();

  const parsed = inviteAdminSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    const fieldErrors: Partial<Record<"name" | "email", string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as "name" | "email" | undefined;
      if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
      fieldErrors,
    };
  }

  const { name, email } = parsed.data;

  // Check email isn't already taken.
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    return {
      error: "An account with this email already exists.",
      fieldErrors: { email: "An account with this email already exists." },
    };
  }

  const tempPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(tempPassword);

  let createdId: string;
  try {
    const created = await prisma.user.create({
      data: {
        name,
        email,
        role: "ADMIN",
        passwordHash,
        // onboardingRequired stays false — admins don't go through
        // employee onboarding. Their account is active immediately
        // and they sign in with the temporary password.
        onboardingRequired: false,
        status: "ACTIVE",
      },
    });
    createdId = created.id;
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return {
        error: "An account with this email already exists.",
        fieldErrors: { email: "An account with this email already exists." },
      };
    }
    return { error: "Could not create the admin account. Please try again." };
  }

  // Send invitation email. If email fails, roll back the user creation
  // so the admin doesn't end up with an account they can't access.
  const appUrl =
    process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? "http://localhost:3000";

  const emailResult = await sendAdminInviteEmail({
    to: email,
    inviterName: session.user.name ?? "A Super Admin",
    temporaryPassword: tempPassword,
    loginUrl: `${appUrl}/login`,
  });

  if (!emailResult.ok) {
    // Roll back.
    await prisma.user.delete({ where: { id: createdId } }).catch(() => {});
    return {
      error: `Admin account created but invitation email failed: ${emailResult.error} — account removed. Please try again.`,
    };
  }

  await recordAuditLog({
    actorId: session.user.id,
    action: "ADMIN_INVITED",
    entityType: "User",
    entityId: createdId,
    metadata: { name, email, invitedBy: session.user.id },
  });

  revalidatePath("/admins");
  return { error: null, success: true };
}

// ─── Deactivate Admin ────────────────────────────────────────────────────────

/**
 * Block an ADMIN's dashboard access by setting status = DEACTIVATED.
 * Uses the dedicated status field — NOT onboardingRequired — so a
 * deactivated admin is sent to /deactivated, not /onboarding.
 * Only SUPER_ADMIN may call this. Cannot deactivate SUPER_ADMINs or the
 * protected system account.
 */
export async function deactivateAdmin(
  targetUserId: string,
  _prevState: AdminActionState,
  _formData: FormData
): Promise<AdminActionState> {
  const session = await requireSuperAdmin();

  if (targetUserId === session.user.id) {
    return { error: "You cannot deactivate your own account." };
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, email: true, role: true, status: true },
  });

  if (!target) return { error: "Admin account not found." };

  // Cannot touch SUPER_ADMIN accounts.
  if (target.role === "SUPER_ADMIN") {
    return { error: "Super-admin accounts cannot be deactivated here." };
  }

  if (target.role !== "ADMIN") {
    return { error: "This account is not an admin." };
  }

  // Protect the system owner.
  if (target.email === PROTECTED_ADMIN_EMAIL) {
    return { error: "The system administrator account cannot be deactivated." };
  }

  if (target.status === "DEACTIVATED") {
    // Already inactive — idempotent success.
    return { error: null, success: true };
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data: { status: "DEACTIVATED" },
  });

  await recordAuditLog({
    actorId: session.user.id,
    action: "ADMIN_DEACTIVATED",
    entityType: "User",
    entityId: targetUserId,
    metadata: { email: target.email, deactivatedBy: session.user.id },
  });

  revalidatePath("/admins");
  return { error: null, success: true };
}

// ─── Reactivate Admin ────────────────────────────────────────────────────────

/**
 * Restore an ADMIN's dashboard access by setting status = ACTIVE.
 * Only SUPER_ADMIN may call this.
 */
export async function reactivateAdmin(
  targetUserId: string,
  _prevState: AdminActionState,
  _formData: FormData
): Promise<AdminActionState> {
  const session = await requireSuperAdmin();

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, email: true, role: true, status: true },
  });

  if (!target) return { error: "Admin account not found." };

  if (target.role !== "ADMIN") {
    return { error: "This account is not an admin." };
  }

  if (target.status === "ACTIVE") {
    // Already active — idempotent success.
    return { error: null, success: true };
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data: { status: "ACTIVE" },
  });

  await recordAuditLog({
    actorId: session.user.id,
    action: "ADMIN_REACTIVATED",
    entityType: "User",
    entityId: targetUserId,
    metadata: { email: target.email },
  });

  revalidatePath("/admins");
  return { error: null, success: true };
}

// ─── Delete Admin ─────────────────────────────────────────────────────────────

export type DeleteAdminResult =
  | { ok: true }
  | { ok: false; message: string };

/**
 * Permanently delete an ADMIN account.
 *
 * Guards (all server-side):
 *  - Only SUPER_ADMIN may call this.
 *  - Cannot delete a SUPER_ADMIN.
 *  - Cannot delete yourself.
 *  - Cannot delete the protected system account.
 *
 * Data handling:
 *  - AuditLog rows where actorId = target are nullified (actorId → null)
 *    so audit history is preserved, just anonymised. The schema uses
 *    onDelete: SetNull on the AuditLog → User FK for exactly this.
 *  - ReturnRequest.reviewedById is also SetNull via schema FK.
 *  - Notification, Account, Session rows cascade-delete via schema FKs.
 *  - An AuditLog entry is written under the acting super-admin's id
 *    recording the permanent deletion.
 */
export async function deleteAdmin(
  targetUserId: string
): Promise<DeleteAdminResult> {
  const session = await requireSuperAdmin();

  if (targetUserId === session.user.id) {
    return { ok: false, message: "You cannot delete your own account." };
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!target) {
    return { ok: false, message: "Admin account not found." };
  }

  if (target.role === "SUPER_ADMIN") {
    return { ok: false, message: "Super-admin accounts cannot be deleted." };
  }

  if (target.role !== "ADMIN") {
    return { ok: false, message: "This account is not an admin." };
  }

  if (target.email === PROTECTED_ADMIN_EMAIL) {
    return {
      ok: false,
      message: "The system administrator account is protected and cannot be deleted.",
    };
  }

  // Record audit BEFORE deletion so the actor reference is still valid.
  await recordAuditLog({
    actorId: session.user.id,
    action: "ADMIN_DELETED",
    entityType: "User",
    entityId: targetUserId,
    metadata: {
      name: target.name,
      email: target.email,
      deletedBy: session.user.id,
    },
  });

  try {
    // Deleting the User row cascades: Account, Session, Notification.
    // AuditLog.actorId and ReturnRequest.reviewedById become null via
    // the onDelete: SetNull FK constraints added in the schema.
    await prisma.user.delete({ where: { id: targetUserId } });
  } catch (err) {
    console.error("[deleteAdmin] error:", err);
    return {
      ok: false,
      message: "Could not delete the admin account. Please try again.",
    };
  }

  revalidatePath("/admins");
  return { ok: true };
}
