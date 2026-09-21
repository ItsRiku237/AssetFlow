"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth-guards";
import { recordAuditLog } from "@/lib/audit";
import { DemoScopeError, assertDemoAssetScope } from "@/lib/demo";
import { prisma } from "@/lib/prisma";
import {
  createNotification,
  createNotifications,
  getAdminUserIds,
} from "@/lib/notifications";
import {
  createReimbursementSchema,
  rejectReimbursementSchema,
} from "@/lib/validations/reimbursement";

export type ReimbursementActionState = { error: string | null };

function revalidateReimbursementPaths() {
  revalidatePath("/reimbursements");
  revalidatePath("/dashboard");
}

// ---------------------------------------------------------------------------
// Employee: submit a reimbursement request
// ---------------------------------------------------------------------------

export async function createReimbursement(
  _prevState: ReimbursementActionState,
  formData: FormData
): Promise<ReimbursementActionState> {
  const session = await requireRole("EMPLOYEE");

  const parsed = createReimbursementSchema.safeParse({
    assetId: formData.get("assetId"),
    maintenanceRecordId: formData.get("maintenanceRecordId"),
    amount: formData.get("amount"),
    description: formData.get("description"),
    receiptReference: formData.get("receiptReference"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { assetId, maintenanceRecordId, amount, description, receiptReference } =
    parsed.data;

  // Resolve the authenticated employee record.
  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
  });
  if (!employee) {
    return { error: "No employee profile found for this account." };
  }
  if (employee.status !== "ACTIVE") {
    return { error: "Your employee account is inactive." };
  }

  // Verify the asset exists.
  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) {
    return { error: "Asset not found." };
  }

  // Employee must have a current or past assignment to the asset.
  const assignment = await prisma.assetAssignment.findFirst({
    where: { assetId, employeeId: employee.id },
  });
  if (!assignment) {
    return {
      error: "You can only submit a reimbursement for an asset assigned to you.",
    };
  }

  try {
    await assertDemoAssetScope(session.user.email, assetId);
  } catch (error) {
    if (error instanceof DemoScopeError) {
      return { error: error.message };
    }
    throw error;
  }

  // Verify maintenance record belongs to this asset, if provided.
  if (maintenanceRecordId) {
    const record = await prisma.maintenanceRecord.findUnique({
      where: { id: maintenanceRecordId },
    });
    if (!record || record.assetId !== assetId) {
      return {
        error: "The maintenance record does not match the selected asset.",
      };
    }
  }

  let reimbursementId: string;
  try {
    const created = await prisma.reimbursement.create({
      data: {
        assetId,
        maintenanceRecordId: maintenanceRecordId ?? null,
        employeeId: employee.id,
        amount,
        description,
        receiptReference: receiptReference ?? null,
        status: "PENDING",
      },
    });
    reimbursementId = created.id;
  } catch {
    return {
      error: "Could not submit the reimbursement request. Please try again.",
    };
  }

  await recordAuditLog({
    actorId: session.user.id,
    action: "REIMBURSEMENT_SUBMITTED",
    entityType: "Reimbursement",
    entityId: reimbursementId,
    metadata: { assetId, amount, employeeId: employee.id },
  });

  const adminIds = await getAdminUserIds();
  await createNotifications(
    adminIds.map((uid) => ({
      userId: uid,
      title: "New reimbursement request",
      message: `${employee.name} submitted a reimbursement request for ${asset.name} (${asset.assetTag}).`,
      link: "/reimbursements",
    }))
  );

  revalidateReimbursementPaths();
  return { error: null };
}

// ---------------------------------------------------------------------------
// Employee: cancel their own PENDING request
// ---------------------------------------------------------------------------

export async function cancelReimbursement(
  reimbursementId: string,
  _prevState: ReimbursementActionState,
  _formData: FormData
): Promise<ReimbursementActionState> {
  const session = await requireRole("EMPLOYEE");

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
  });
  if (!employee) {
    return { error: "No employee profile found for this account." };
  }

  const request = await prisma.reimbursement.findUnique({
    where: { id: reimbursementId },
  });
  if (!request) {
    return { error: "Reimbursement request not found." };
  }

  // Server-side ownership check — never trust the client.
  if (request.employeeId !== employee.id) {
    return { error: "You can only cancel your own reimbursement requests." };
  }

  if (request.status !== "PENDING") {
    return {
      error: "Only pending requests can be cancelled.",
    };
  }

  try {
    await prisma.reimbursement.updateMany({
      where: { id: reimbursementId, status: "PENDING", employeeId: employee.id },
      data: { status: "CANCELLED" },
    });
  } catch {
    return { error: "Could not cancel the request. Please try again." };
  }

  await recordAuditLog({
    actorId: session.user.id,
    action: "REIMBURSEMENT_CANCELLED",
    entityType: "Reimbursement",
    entityId: reimbursementId,
    metadata: { assetId: request.assetId, employeeId: employee.id },
  });

  revalidateReimbursementPaths();
  return { error: null };
}

// ---------------------------------------------------------------------------
// Admin: approve a reimbursement request
// ---------------------------------------------------------------------------

export async function approveReimbursement(
  reimbursementId: string,
  _prevState: ReimbursementActionState,
  _formData: FormData
): Promise<ReimbursementActionState> {
  const session = await requireRole("ADMIN");

  const request = await prisma.reimbursement.findUnique({
    where: { id: reimbursementId },
    include: {
      employee: { select: { userId: true, name: true } },
      asset: { select: { name: true, assetTag: true } },
    },
  });

  if (!request) {
    return { error: "Reimbursement request not found." };
  }
  if (request.status !== "PENDING") {
    return { error: "This request has already been processed." };
  }

  // Self-approval prevention: the reviewing admin's employee record must
  // not match the request's employeeId. This check uses the admin's
  // linked employee record (if any) — most admins won't have one, but
  // we still enforce it as a defence-in-depth measure.
  const adminEmployee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (adminEmployee && adminEmployee.id === request.employeeId) {
    return { error: "You cannot approve your own reimbursement request." };
  }

  try {
    await assertDemoAssetScope(session.user.email, request.assetId);
  } catch (error) {
    if (error instanceof DemoScopeError) {
      return { error: error.message };
    }
    throw error;
  }

  try {
    const updated = await prisma.reimbursement.updateMany({
      where: { id: reimbursementId, status: "PENDING" },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewedById: session.user.id,
      },
    });
    if (updated.count === 0) {
      return { error: "This request has already been processed." };
    }
  } catch {
    return { error: "Could not approve the request. Please try again." };
  }

  await recordAuditLog({
    actorId: session.user.id,
    action: "REIMBURSEMENT_APPROVED",
    entityType: "Reimbursement",
    entityId: reimbursementId,
    metadata: {
      assetId: request.assetId,
      amount: request.amount.toString(),
      employeeId: request.employeeId,
    },
  });

  if (request.employee.userId) {
    await createNotification({
      userId: request.employee.userId,
      title: "Reimbursement approved",
      message: `Your reimbursement request for ${request.asset.name} (${request.asset.assetTag}) has been approved.`,
      link: "/reimbursements",
    });
  }

  revalidateReimbursementPaths();
  return { error: null };
}

// ---------------------------------------------------------------------------
// Admin: reject a reimbursement request
// ---------------------------------------------------------------------------

export async function rejectReimbursement(
  reimbursementId: string,
  _prevState: ReimbursementActionState,
  formData: FormData
): Promise<ReimbursementActionState> {
  const session = await requireRole("ADMIN");

  const parsed = rejectReimbursementSchema.safeParse({
    rejectionReason: formData.get("rejectionReason"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { rejectionReason } = parsed.data;

  const request = await prisma.reimbursement.findUnique({
    where: { id: reimbursementId },
    include: {
      employee: { select: { userId: true, name: true } },
      asset: { select: { name: true, assetTag: true } },
    },
  });

  if (!request) {
    return { error: "Reimbursement request not found." };
  }
  if (request.status !== "PENDING") {
    return { error: "This request has already been processed." };
  }

  try {
    await assertDemoAssetScope(session.user.email, request.assetId);
  } catch (error) {
    if (error instanceof DemoScopeError) {
      return { error: error.message };
    }
    throw error;
  }

  try {
    const updated = await prisma.reimbursement.updateMany({
      where: { id: reimbursementId, status: "PENDING" },
      data: {
        status: "REJECTED",
        reviewedAt: new Date(),
        reviewedById: session.user.id,
        rejectionReason,
      },
    });
    if (updated.count === 0) {
      return { error: "This request has already been processed." };
    }
  } catch {
    return { error: "Could not reject the request. Please try again." };
  }

  await recordAuditLog({
    actorId: session.user.id,
    action: "REIMBURSEMENT_REJECTED",
    entityType: "Reimbursement",
    entityId: reimbursementId,
    metadata: {
      assetId: request.assetId,
      rejectionReason,
      employeeId: request.employeeId,
    },
  });

  if (request.employee.userId) {
    await createNotification({
      userId: request.employee.userId,
      title: "Reimbursement rejected",
      message: `Your reimbursement request for ${request.asset.name} (${request.asset.assetTag}) was not approved: ${rejectionReason}`,
      link: "/reimbursements",
    });
  }

  revalidateReimbursementPaths();
  return { error: null };
}
