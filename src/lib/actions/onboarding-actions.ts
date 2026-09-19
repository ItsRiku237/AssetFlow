"use server";

import { requireAuth } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import {
  onboardingSchema,
  type OnboardingActionState,
} from "@/lib/validations/onboarding";

export type { OnboardingActionState };

export async function completeOnboarding(
  _prevState: OnboardingActionState,
  formData: FormData
): Promise<OnboardingActionState> {
  // Must be authenticated (any role/status) — but NOT yet onboarded.
  const session = await requireAuth();
  const userId = session.user.id;

  // Guard: if somehow already linked, do nothing.
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboardingRequired: true, employee: { select: { id: true } } },
  });

  if (!currentUser) {
    return { error: "Session error. Please sign in again.", success: false };
  }

  if (currentUser.employee !== null || !currentUser.onboardingRequired) {
    // Already onboarded — just succeed (idempotent).
    return { error: null, success: true };
  }

  const parsed = onboardingSchema.safeParse({
    employeeCode: formData.get("employeeCode"),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid Employee ID.",
      success: false,
    };
  }

  const { employeeCode } = parsed.data;

  // Look up the employee record.
  // Note: we do NOT return a different error for "not found" vs
  // "already linked" — both return the same message to avoid
  // letting anyone enumerate valid employee codes.
  const employee = await prisma.employee.findUnique({
    where: { employeeCode },
    select: {
      id: true,
      status: true,
      userId: true,
      name: true,
      email: true,
    },
  });

  const REJECTION_MESSAGE =
    "No eligible employee record found for this Employee ID.";

  if (!employee) {
    return { error: REJECTION_MESSAGE, success: false };
  }

  // Employee must be ACTIVE.
  if (employee.status !== "ACTIVE") {
    return { error: REJECTION_MESSAGE, success: false };
  }

  // Employee must not already be linked to another User.
  if (employee.userId !== null && employee.userId !== userId) {
    return { error: REJECTION_MESSAGE, success: false };
  }

  // If the employee record has an email and the signing-in user has
  // a different email, reject as an additional identity check.
  const currentUserEmail = session.user.email;
  if (
    employee.email &&
    currentUserEmail &&
    employee.email.toLowerCase() !== currentUserEmail.toLowerCase()
  ) {
    return {
      error:
        "The email address on this Employee record does not match your account.",
      success: false,
    };
  }

  // Everything checks out — link atomically.
  try {
    await prisma.$transaction(async (tx) => {
      // Conditional update: only succeeds if userId is still null
      // (race-condition guard — two simultaneous claims can't both succeed).
      const result = await tx.employee.updateMany({
        where: { id: employee.id, userId: null },
        data: { userId },
      });

      if (result.count === 0) {
        // Another request just claimed this employee — or it was
        // already linked. Either way, reject this one.
        throw new Error("already_claimed");
      }

      // Mark the User as onboarded and role=EMPLOYEE.
      await tx.user.update({
        where: { id: userId },
        data: { onboardingRequired: false, role: "EMPLOYEE" },
      });

      await tx.auditLog.create({
        data: {
          actorId: userId,
          action: "EMPLOYEE_ACCOUNT_LINKED",
          entityType: "Employee",
          entityId: employee.id,
          metadata: {
            employeeCode,
            userId,
          },
        },
      });
    });
  } catch (err) {
    if (err instanceof Error && err.message === "already_claimed") {
      return { error: REJECTION_MESSAGE, success: false };
    }
    return {
      error: "Could not complete onboarding. Please try again.",
      success: false,
    };
  }

  return { error: null, success: true };
}
