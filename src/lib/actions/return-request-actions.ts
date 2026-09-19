"use server";

import { revalidatePath } from "next/cache";

import { assertValidAssetTransition } from "@/lib/asset-lifecycle";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import {
  createNotification,
  createNotifications,
  getAdminUserIds,
} from "@/lib/notifications";
import {
  approveReturnRequestSchema,
  createReturnRequestSchema,
} from "@/lib/validations/return-request";
import type { AssetStatus } from "@/types/asset";

export type ReturnRequestActionState = { error: string | null };

// ---------------------------------------------------------------------------
// Employee: create a return request
// ---------------------------------------------------------------------------

export async function createReturnRequest(
  assetId: string,
  _prevState: ReturnRequestActionState,
  formData: FormData
): Promise<ReturnRequestActionState> {
  const session = await requireRole("EMPLOYEE");

  const parsed = createReturnRequestSchema.safeParse({
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { reason } = parsed.data;

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
  });
  if (!employee) {
    return { error: "No employee profile found for this account." };
  }

  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) {
    return { error: "Asset not found." };
  }

  const activeAssignment = await prisma.assetAssignment.findFirst({
    where: { assetId, employeeId: employee.id, status: "ACTIVE" },
  });
  if (!activeAssignment) {
    return { error: "This asset isn't currently assigned to you." };
  }

  try {
    assertValidAssetTransition(asset.status, "RETURN_REQUESTED");
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "A return can't be requested for this asset right now.",
    };
  }

  const existingPending = await prisma.returnRequest.findFirst({
    where: { assetId, status: "PENDING" },
  });
  if (existingPending) {
    return { error: "A return request for this asset is already pending." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const result = await tx.asset.updateMany({
        where: { id: assetId, status: "ASSIGNED" },
        data: { status: "RETURN_REQUESTED" },
      });
      if (result.count === 0) {
        throw new Error(
          "This asset's status just changed — refresh and try again."
        );
      }

      const request = await tx.returnRequest.create({
        data: { assetId, employeeId: employee.id, reason, status: "PENDING" },
      });

      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "RETURN_REQUEST_CREATED",
          entityType: "ReturnRequest",
          entityId: request.id,
          metadata: { assetId, reason },
        },
      });
      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "ASSET_STATUS_CHANGED",
          entityType: "Asset",
          entityId: assetId,
          metadata: { from: "ASSIGNED", to: "RETURN_REQUESTED" },
        },
      });
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not submit the return request. Please try again.",
    };
  }

  const adminIds = await getAdminUserIds();
  await createNotifications(
    adminIds.map((uid) => ({
      userId: uid,
      title: "Return request submitted",
      message: `A return request was submitted for ${asset.name} (${asset.assetTag}).`,
      link: "/return-requests",
    }))
  );

  revalidatePath(`/assets/${assetId}`);
  revalidatePath("/assets");
  revalidatePath("/my-assets");
  revalidatePath("/return-requests");
  revalidatePath("/dashboard");

  return { error: null };
}

// ---------------------------------------------------------------------------
// Admin: approve a pending return request
// ---------------------------------------------------------------------------

export async function approveReturnRequest(
  requestId: string,
  _prevState: ReturnRequestActionState,
  formData: FormData
): Promise<ReturnRequestActionState> {
  const session = await requireRole("ADMIN");

  const parsed = approveReturnRequestSchema.safeParse({
    nextStatus: formData.get("nextStatus"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const nextStatus: AssetStatus = parsed.data.nextStatus;

  const request = await prisma.returnRequest.findUnique({
    where: { id: requestId },
    include: { employee: { select: { userId: true } } },
  });
  if (!request) {
    return { error: "Return request not found." };
  }
  if (request.status !== "PENDING") {
    return { error: "This request has already been processed." };
  }

  const asset = await prisma.asset.findUnique({
    where: { id: request.assetId },
  });
  if (!asset) {
    return { error: "Asset not found." };
  }

  try {
    assertValidAssetTransition(asset.status, nextStatus);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "This asset can't move to that status right now.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const requestUpdate = await tx.returnRequest.updateMany({
        where: { id: requestId, status: "PENDING" },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
          reviewedById: session.user.id,
        },
      });
      if (requestUpdate.count === 0) {
        throw new Error("This request has already been processed.");
      }

      const assetUpdate = await tx.asset.updateMany({
        where: { id: request.assetId, status: "RETURN_REQUESTED" },
        data: { status: nextStatus },
      });
      if (assetUpdate.count === 0) {
        throw new Error(
          "This asset's status just changed — refresh and try again."
        );
      }

      // End the active custody record but keep it as history.
      await tx.assetAssignment.updateMany({
        where: { assetId: request.assetId, status: "ACTIVE" },
        data: { status: "RETURNED", returnedAt: new Date() },
      });

      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "RETURN_REQUEST_APPROVED",
          entityType: "ReturnRequest",
          entityId: requestId,
          metadata: { assetId: request.assetId, nextStatus },
        },
      });
      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "ASSET_STATUS_CHANGED",
          entityType: "Asset",
          entityId: request.assetId,
          metadata: { from: "RETURN_REQUESTED", to: nextStatus },
        },
      });
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not approve the request. Please try again.",
    };
  }

  if (request.employee.userId) {
    await createNotification({
      userId: request.employee.userId,
      title: "Return request approved",
      message: `Your return request for ${asset.name} (${asset.assetTag}) was approved.`,
      link: "/my-assets",
    });
  }

  revalidatePath("/return-requests");
  revalidatePath("/assets");
  revalidatePath(`/assets/${request.assetId}`);
  revalidatePath("/employees");
  revalidatePath("/my-assets");
  revalidatePath("/dashboard");

  return { error: null };
}

// ---------------------------------------------------------------------------
// Admin: reject a pending return request
// ---------------------------------------------------------------------------

export async function rejectReturnRequest(
  requestId: string,
  _prevState: ReturnRequestActionState,
  _formData: FormData
): Promise<ReturnRequestActionState> {
  const session = await requireRole("ADMIN");

  const request = await prisma.returnRequest.findUnique({
    where: { id: requestId },
    include: { employee: { select: { userId: true } } },
  });
  if (!request) {
    return { error: "Return request not found." };
  }
  if (request.status !== "PENDING") {
    return { error: "This request has already been processed." };
  }

  const asset = await prisma.asset.findUnique({
    where: { id: request.assetId },
  });
  if (!asset) {
    return { error: "Asset not found." };
  }

  try {
    assertValidAssetTransition(asset.status, "ASSIGNED");
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "This request can't be rejected right now.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const requestUpdate = await tx.returnRequest.updateMany({
        where: { id: requestId, status: "PENDING" },
        data: {
          status: "REJECTED",
          reviewedAt: new Date(),
          reviewedById: session.user.id,
        },
      });
      if (requestUpdate.count === 0) {
        throw new Error("This request has already been processed.");
      }

      // The assignment was never touched when the request was
      // created, so rejecting it only needs to undo the asset's
      // status flag — custody reverts with no further changes.
      const assetUpdate = await tx.asset.updateMany({
        where: { id: request.assetId, status: "RETURN_REQUESTED" },
        data: { status: "ASSIGNED" },
      });
      if (assetUpdate.count === 0) {
        throw new Error(
          "This asset's status just changed — refresh and try again."
        );
      }

      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "RETURN_REQUEST_REJECTED",
          entityType: "ReturnRequest",
          entityId: requestId,
          metadata: { assetId: request.assetId },
        },
      });
      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "ASSET_STATUS_CHANGED",
          entityType: "Asset",
          entityId: request.assetId,
          metadata: { from: "RETURN_REQUESTED", to: "ASSIGNED" },
        },
      });
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not reject the request. Please try again.",
    };
  }

  if (request.employee.userId) {
    await createNotification({
      userId: request.employee.userId,
      title: "Return request rejected",
      message: `Your return request for ${asset.name} (${asset.assetTag}) was not approved.`,
      link: "/my-assets",
    });
  }

  revalidatePath("/return-requests");
  revalidatePath("/assets");
  revalidatePath(`/assets/${request.assetId}`);
  revalidatePath("/my-assets");
  revalidatePath("/dashboard");

  return { error: null };
}
