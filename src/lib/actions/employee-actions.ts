"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth-guards";
import { recordAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  type CreateEmployeeInput,
  type UpdateEmployeeInput,
} from "@/lib/validations/employee";

export type EmployeeActionState = { error: string | null };

/**
 * Email of the protected admin account (seeded owner).
 * This account must never be deletable through the UI.
 */
const PROTECTED_ADMIN_EMAIL = "admin@assetflow.dev";

function parseCreateEmployeeForm(formData: FormData) {
  return createEmployeeSchema.safeParse(Object.fromEntries(formData.entries()));
}

function parseUpdateEmployeeForm(formData: FormData) {
  return updateEmployeeSchema.safeParse(Object.fromEntries(formData.entries()));
}

function toCreateData(input: CreateEmployeeInput) {
  return {
    employeeCode: input.employeeCode,
    name: input.name,
    email: input.email ?? null,
    department: input.department ?? null,
    designation: input.designation ?? null,
    phone: input.phone ?? null,
  };
}

function toUpdateData(input: UpdateEmployeeInput) {
  return {
    employeeCode: input.employeeCode,
    name: input.name,
    email: input.email ?? null,
    department: input.department ?? null,
    designation: input.designation ?? null,
    phone: input.phone ?? null,
    status: input.status,
  };
}

function uniqueConstraintMessage(error: Prisma.PrismaClientKnownRequestError) {
  const target = error.meta?.target;
  const field = Array.isArray(target) ? target.join(", ") : "field";
  if (field.includes("employeeCode")) {
    return "An employee with this Employee ID already exists.";
  }
  return "An employee with this value already exists.";
}

export async function createEmployee(
  _prevState: EmployeeActionState,
  formData: FormData
): Promise<EmployeeActionState> {
  const session = await requireRole("ADMIN");

  const parsed = parseCreateEmployeeForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  let created;
  try {
    created = await prisma.employee.create({ data: toCreateData(parsed.data) });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: uniqueConstraintMessage(error) };
    }
    return { error: "Could not create the employee. Please try again." };
  }

  await recordAuditLog({
    actorId: session.user.id,
    action: "EMPLOYEE_CREATED",
    entityType: "Employee",
    entityId: created.id,
    metadata: { employeeCode: created.employeeCode, name: created.name },
  });

  revalidatePath("/employees");
  redirect(`/employees/${created.id}`);
}

export async function updateEmployee(
  employeeId: string,
  _prevState: EmployeeActionState,
  formData: FormData
): Promise<EmployeeActionState> {
  const session = await requireRole("ADMIN");

  const existing = await prisma.employee.findUnique({
    where: { id: employeeId },
  });
  if (!existing) {
    return { error: "Employee not found." };
  }

  const parsed = parseUpdateEmployeeForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await prisma.employee.update({
      where: { id: employeeId },
      data: toUpdateData(parsed.data),
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: uniqueConstraintMessage(error) };
    }
    return { error: "Could not update the employee. Please try again." };
  }

  await recordAuditLog({
    actorId: session.user.id,
    action: "EMPLOYEE_UPDATED",
    entityType: "Employee",
    entityId: employeeId,
    metadata: {
      employeeCode: parsed.data.employeeCode,
      status: parsed.data.status,
    },
  });

  revalidatePath("/employees");
  revalidatePath(`/employees/${employeeId}`);
  redirect(`/employees/${employeeId}`);
}

export async function deactivateEmployee(
  employeeId: string,
  _prevState: EmployeeActionState,
  _formData: FormData
): Promise<EmployeeActionState> {
  const session = await requireRole("ADMIN");

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { user: { select: { id: true, email: true, role: true } } },
  });
  if (!employee) {
    return { error: "Employee not found." };
  }
  if (employee.status === "INACTIVE") {
    return { error: null };
  }

  // Protect the system admin account and any SUPER_ADMIN-linked employee.
  if (employee.user?.email === PROTECTED_ADMIN_EMAIL) {
    return { error: "The system administrator account cannot be deactivated." };
  }
  if (employee.user?.role === "SUPER_ADMIN") {
    return { error: "Super-admin accounts cannot be deactivated through this interface." };
  }

  await prisma.$transaction(async (tx) => {
    // Flip employee status to INACTIVE.
    await tx.employee.update({
      where: { id: employeeId },
      data: { status: "INACTIVE" },
    });

    // Block the linked User account from the dashboard by setting
    // onboardingRequired = true. This integrates cleanly with the
    // existing proxy/dashboard layout guard without touching Auth.js.
    if (employee.userId) {
      await tx.user.update({
        where: { id: employee.userId },
        data: { onboardingRequired: true },
      });
    }
  });

  await recordAuditLog({
    actorId: session.user.id,
    action: "EMPLOYEE_DEACTIVATED",
    entityType: "Employee",
    entityId: employeeId,
    metadata: { employeeCode: employee.employeeCode, name: employee.name },
  });

  revalidatePath("/employees");
  revalidatePath(`/employees/${employeeId}`);
  return { error: null };
}

export async function reactivateEmployee(
  employeeId: string,
  _prevState: EmployeeActionState,
  _formData: FormData
): Promise<EmployeeActionState> {
  const session = await requireRole("ADMIN");

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { user: { select: { id: true } } },
  });
  if (!employee) {
    return { error: "Employee not found." };
  }
  if (employee.status === "ACTIVE") {
    return { error: null };
  }

  await prisma.$transaction(async (tx) => {
    await tx.employee.update({
      where: { id: employeeId },
      data: { status: "ACTIVE" },
    });

    // Re-enable the linked account's dashboard access.
    if (employee.userId) {
      await tx.user.update({
        where: { id: employee.userId },
        data: { onboardingRequired: false },
      });
    }
  });

  await recordAuditLog({
    actorId: session.user.id,
    action: "EMPLOYEE_REACTIVATED",
    entityType: "Employee",
    entityId: employeeId,
    metadata: { employeeCode: employee.employeeCode, name: employee.name },
  });

  revalidatePath("/employees");
  revalidatePath(`/employees/${employeeId}`);
  return { error: null };
}

// ─── Permanent deletion ─────────────────────────────────────────────────────

export type DeleteEmployeeResult =
  | { ok: true }
  | { ok: false; reason: "protected" | "has_history" | "not_found" | "error"; message: string };

export async function deleteEmployee(
  employeeId: string
): Promise<DeleteEmployeeResult> {
  const session = await requireRole("ADMIN");

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      user: { select: { id: true, email: true, role: true } },
      _count: {
        select: {
          assignments: true,
          returnRequests: true,
        },
      },
    },
  });

  if (!employee) {
    return { ok: false, reason: "not_found", message: "Employee not found." };
  }

  // ── Protection: never delete the system admin ──────────────────────────
  if (employee.user?.email === PROTECTED_ADMIN_EMAIL) {
    return {
      ok: false,
      reason: "protected",
      message: "The system administrator account is protected and cannot be deleted.",
    };
  }

  if (employee.user?.role === "ADMIN" || employee.user?.role === "SUPER_ADMIN") {
    return {
      ok: false,
      reason: "protected",
      message: "Admin and super-admin accounts cannot be deleted through this interface.",
    };
  }

  // ── Dependency check: block if business history exists ─────────────────
  // AssetAssignment and ReturnRequest have onDelete: Cascade on Employee,
  // so deleting the Employee would cascade-delete that history. We block
  // this rather than destroying the data silently.
  if (employee._count.assignments > 0) {
    return {
      ok: false,
      reason: "has_history",
      message: `This employee has ${employee._count.assignments} asset assignment record${employee._count.assignments === 1 ? "" : "s"} that must be preserved. Deactivate the employee instead.`,
    };
  }

  if (employee._count.returnRequests > 0) {
    return {
      ok: false,
      reason: "has_history",
      message: `This employee has ${employee._count.returnRequests} return request record${employee._count.returnRequests === 1 ? "" : "s"} that must be preserved. Deactivate the employee instead.`,
    };
  }

  // ── Safe to delete ─────────────────────────────────────────────────────
  try {
    await prisma.$transaction(async (tx) => {
      // Clean up OTP records (no FK, keyed by employeeCode string).
      await tx.employeeOtp.deleteMany({
        where: { employeeCode: employee.employeeCode },
      });

      // Delete the Employee record.
      // With no assignments/returnRequests, there's nothing to cascade.
      await tx.employee.delete({ where: { id: employeeId } });

      // If there's a linked User account that is an employee-only account
      // (not an admin), delete it too. AuditLog.actorId is nullable so
      // those rows stay (actorId becomes null via SetNull default).
      if (employee.userId && employee.user?.role === "EMPLOYEE") {
        await tx.user.delete({ where: { id: employee.userId } });
      }
    });
  } catch (err) {
    console.error("[deleteEmployee] error:", err);
    return {
      ok: false,
      reason: "error",
      message: "Could not delete the employee. Please try again.",
    };
  }

  await recordAuditLog({
    actorId: session.user.id,
    action: "EMPLOYEE_DELETED",
    entityType: "Employee",
    entityId: employeeId,
    metadata: {
      employeeCode: employee.employeeCode,
      name: employee.name,
      hadLinkedAccount: employee.userId !== null,
    },
  });

  revalidatePath("/employees");
  return { ok: true };
}
