"use server";

import { requireAuth } from "@/lib/auth-guards";
import { recordAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { changePasswordSchema } from "@/lib/validations/settings";

export type ChangePasswordActionState = {
  error: string | null;
  success?: boolean;
};

/**
 * Change the current user's own password.
 *
 * - Requires authentication only (any role) — this is a self-service
 *   action, never an admin-on-behalf-of-someone-else action.
 * - Only works for accounts that already have a passwordHash
 *   (credentials-based accounts). Google-only accounts have nothing
 *   to change here.
 * - Verifies the current password server-side before accepting a new
 *   one — never trusts the client.
 */
export async function changePassword(
  _prevState: ChangePasswordActionState,
  formData: FormData
): Promise<ChangePasswordActionState> {
  const session = await requireAuth();

  const parsed = changePasswordSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
      success: false,
    };
  }
  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, passwordHash: true, email: true },
  });
  if (!user) {
    return { error: "Account not found.", success: false };
  }
  if (!user.passwordHash) {
    return {
      error:
        "This account signs in with Google and has no password to change.",
      success: false,
    };
  }

  const isValid = await verifyPassword(currentPassword, user.passwordHash);
  if (!isValid) {
    return { error: "Current password is incorrect.", success: false };
  }

  const newHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  await recordAuditLog({
    actorId: user.id,
    action: "PASSWORD_CHANGED",
    entityType: "User",
    entityId: user.id,
    // Never log password values or hashes.
    metadata: { email: user.email },
  });

  return { error: null, success: true };
}
