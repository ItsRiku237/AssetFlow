"use server";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import {
  registerEmployeeSchema,
  type RegisterActionState,
} from "@/lib/validations/register";

export type { RegisterActionState };

/**
 * Generic rejection message — deliberately vague to prevent Employee
 * ID enumeration. We return the same string whether the code doesn't
 * exist, the employee is INACTIVE, or they're already linked.
 */
const EMPLOYEE_REJECTION =
  "No eligible employee record found for this Employee ID. Contact your administrator if you believe this is an error.";

export async function registerEmployee(
  _prevState: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> {
  const raw = {
    employeeCode: formData.get("employeeCode"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    name: formData.get("name"),
  };

  const parsed = registerEmployeeSchema.safeParse(raw);
  if (!parsed.success) {
    // Surface the first issue per field so the form can show them inline.
    const fieldErrors: Partial<Record<string, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as string | undefined;
      if (field && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return {
      error: null,
      fieldErrors,
      success: false,
    };
  }

  const { employeeCode, email, password, name } = parsed.data;

  // Verify the employee record.
  const employee = await prisma.employee.findUnique({
    where: { employeeCode },
    select: {
      id: true,
      status: true,
      userId: true,
      email: true,
      name: true,
    },
  });

  if (!employee || employee.status !== "ACTIVE") {
    return { error: EMPLOYEE_REJECTION, success: false };
  }

  // Employee must not already have a linked User account.
  if (employee.userId !== null) {
    return { error: EMPLOYEE_REJECTION, success: false };
  }

  // If the Employee directory already has an email, the supplied
  // email must match — prevents someone from claiming another person's
  // record by guessing their Employee ID alone.
  if (
    employee.email &&
    employee.email.toLowerCase() !== email.toLowerCase()
  ) {
    return {
      error:
        "The email address on this Employee record does not match the one you entered. Use the email your administrator registered, or contact them to update the record.",
      success: false,
    };
  }

  const passwordHash = await hashPassword(password);

  try {
    await prisma.$transaction(async (tx) => {
      // Check the email isn't already taken (could race with another
      // registration or an existing Google account).
      const existingUser = await tx.user.findUnique({
        where: { email },
        select: { id: true },
      });
      if (existingUser) {
        throw new Error("email_taken");
      }

      // Create the User account.
      const user = await tx.user.create({
        data: {
          name,
          email,
          role: "EMPLOYEE",
          passwordHash,
          onboardingRequired: false,
        },
      });

      // Atomically claim the Employee record (userId: null guard prevents
      // a concurrent registration from also succeeding).
      const linked = await tx.employee.updateMany({
        where: { id: employee.id, userId: null },
        data: { userId: user.id },
      });

      if (linked.count === 0) {
        throw new Error("already_claimed");
      }

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: "EMPLOYEE_ACCOUNT_CREATED",
          entityType: "Employee",
          entityId: employee.id,
          metadata: {
            employeeCode,
            userId: user.id,
            // intentionally not logging the password hash
          },
        },
      });
    });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "email_taken") {
        return {
          error:
            "An account with this email address already exists. Sign in instead.",
          success: false,
        };
      }
      if (err.message === "already_claimed") {
        return { error: EMPLOYEE_REJECTION, success: false };
      }
    }
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return {
        error:
          "An account with this email address already exists. Sign in instead.",
        success: false,
      };
    }
    return {
      error: "Could not create your account. Please try again.",
      success: false,
    };
  }

  return { error: null, success: true };
}
