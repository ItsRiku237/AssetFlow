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
  };
}

function toUpdateData(input: UpdateEmployeeInput) {
  return {
    employeeCode: input.employeeCode,
    name: input.name,
    email: input.email ?? null,
    department: input.department ?? null,
    designation: input.designation ?? null,
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

  // Editing directory details never touches AssetAssignment,
  // ReturnRequest, MaintenanceRecord, AuditLog, or the User link —
  // those relations key off employeeId/userId, neither of which
  // this form can change, so existing history stays intact.
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
  });
  if (!employee) {
    return { error: "Employee not found." };
  }
  if (employee.status === "INACTIVE") {
    return { error: null };
  }

  // Deactivating only flips status — AssetAssignment, ReturnRequest,
  // MaintenanceRecord, and AuditLog rows referencing this employee
  // are untouched, so all history is preserved.
  await prisma.employee.update({
    where: { id: employeeId },
    data: { status: "INACTIVE" },
  });

  await recordAuditLog({
    actorId: session.user.id,
    action: "EMPLOYEE_DEACTIVATED",
    entityType: "Employee",
    entityId: employeeId,
    metadata: { employeeCode: employee.employeeCode },
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
  });
  if (!employee) {
    return { error: "Employee not found." };
  }
  if (employee.status === "ACTIVE") {
    return { error: null };
  }

  await prisma.employee.update({
    where: { id: employeeId },
    data: { status: "ACTIVE" },
  });

  await recordAuditLog({
    actorId: session.user.id,
    action: "EMPLOYEE_REACTIVATED",
    entityType: "Employee",
    entityId: employeeId,
    metadata: { employeeCode: employee.employeeCode },
  });

  revalidatePath("/employees");
  revalidatePath(`/employees/${employeeId}`);
  return { error: null };
}
