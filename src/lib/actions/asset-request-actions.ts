"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import {
  createNotification,
  createNotifications,
  getAdminUserIds,
} from "@/lib/notifications";
import {
  createAssetRequestSchema,
  reviewAssetRequestSchema,
} from "@/lib/validations/asset-request";

export type AssetRequestActionState = { error: string | null };

// ─── Eligibility policy ──────────────────────────────────────────────────────
// Server-side only. Never trust values from the client.

interface EligibilityResult {
  ok: boolean;
  error?: string;
  employee?: { id: string; status: string; userId: string | null };
  asset?: { id: string; status: string; name: string; assetTag: string };
}

async function checkEligibility(
  userId: string,
  assetId: string
): Promise<EligibilityResult> {
  // 1. Authenticated employee record must exist.
  const employee = await prisma.employee.findUnique({
    where: { userId },
    select: { id: true, status: true, userId: true },
  });
  if (!employee) {
    return { ok: false, error: "No employee profile is linked to your account." };
  }

  // 2. Employee account must be active.
  if (employee.status !== "ACTIVE") {
    return { ok: false, error: "Your employee account is not active." };
  }

  // 3. Asset must exist.
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    select: { id: true, status: true, name: true, assetTag: true },
  });
  if (!asset) {
    return { ok: false, error: "Asset not found." };
  }

  // 4. Asset must be AVAILABLE (not ASSIGNED, IN_REPAIR, RETIRED, etc.).
  if (asset.status !== "AVAILABLE") {
    const readable: Record<string, string> = {
      ASSIGNED: "This asset is already assigned to someone.",
      IN_REPAIR: "This asset is currently under repair.",
      RETIRED: "This asset has been retired and cannot be requested.",
      RETURN_REQUESTED: "This asset has a pending return request.",
    };
    return {
      ok: false,
      error: readable[asset.status] ?? "This asset is not available for requests.",
    };
  }

  // 5. Employee must not already hold this asset.
  const alreadyAssigned = await prisma.assetAssignment.findFirst({
    where: { assetId, employeeId: employee.id, status: "ACTIVE" },
  });
  if (alreadyAssigned) {
    return { ok: false, error: "This asset is already assigned to you." };
  }

  // 6. Employee must not already have a PENDING request for this asset.
  const existingRequest = await prisma.assetRequest.findFirst({
    where: { assetId, employeeId: employee.id, status: "PENDING" },
  });
  if (existingRequest) {
    return {
      ok: false,
      error: "You already have a pending request for this asset.",
    };
  }

  return { ok: true, employee, asset };
}

// ─── Create request (Employee) ───────────────────────────────────────────────

export async function createAssetRequest(
  assetId: string,
  _prevState: AssetRequestActionState,
  formData: FormData
): Promise<AssetRequestActionState> {
  const session = await requireRole("EMPLOYEE");

  const parsed = createAssetRequestSchema.safeParse({
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const eligibility = await checkEligibility(session.user.id, assetId);
  if (!eligibility.ok || !eligibility.employee || !eligibility.asset) {
    return { error: eligibility.error ?? "This asset cannot be requested." };
  }

  const { employee, asset } = eligibility;

  let requestId: string;
  try {
    const request = await prisma.assetRequest.create({
      data: {
        assetId,
        employeeId: employee.id,
        reason: parsed.data.reason ?? null,
        status: "PENDING",
      },
    });
    requestId = request.id;

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "ASSET_REQUEST_CREATED",
        entityType: "AssetRequest",
        entityId: requestId,
        metadata: {
          assetId,
          assetName: asset.name,
          assetTag: asset.assetTag,
          reason: parsed.data.reason ?? null,
        },
      },
    });
  } catch {
    return { error: "Could not submit the request. Please try again." };
  }

  // Notify all admins.
  const adminIds = await getAdminUserIds();
  await createNotifications(
    adminIds.map((uid) => ({
      userId: uid,
      title: "New asset request",
      message: `An employee has requested ${asset.name} (${asset.assetTag}).`,
      link: "/asset-requests",
    }))
  );

  revalidatePath("/my-assets");
  revalidatePath("/asset-requests");
  revalidatePath(`/assets/${assetId}`);
  revalidatePath("/dashboard");

  return { error: null };
}

// ─── Cancel request (Employee — own requests only) ───────────────────────────

export async function cancelAssetRequest(
  requestId: string,
  _prevState: AssetRequestActionState,
  _formData: FormData
): Promise<AssetRequestActionState> {
  const session = await requireRole("EMPLOYEE");

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!employee) {
    return { error: "No employee profile found." };
  }

  // Load and verify ownership server-side.
  const request = await prisma.assetRequest.findUnique({
    where: { id: requestId },
    select: {
      id: true,
      assetId: true,
      employeeId: true,
      status: true,
      asset: { select: { name: true, assetTag: true } },
    },
  });
  if (!request) return { error: "Request not found." };

  // Employees may only cancel their own requests.
  if (request.employeeId !== employee.id) {
    return { error: "You can only cancel your own requests." };
  }

  // Only PENDING requests may be cancelled.
  if (request.status !== "PENDING") {
    return {
      error:
        request.status === "APPROVED"
          ? "This request has already been approved."
          : request.status === "REJECTED"
          ? "This request has already been rejected."
          : "This request cannot be cancelled.",
    };
  }

  await prisma.assetRequest.update({
    where: { id: requestId },
    data: { status: "CANCELLED" },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "ASSET_REQUEST_CANCELLED",
      entityType: "AssetRequest",
      entityId: requestId,
      metadata: {
        assetId: request.assetId,
        assetName: request.asset.name,
        assetTag: request.asset.assetTag,
      },
    },
  });

  revalidatePath("/my-assets");
  revalidatePath("/asset-requests");
  revalidatePath(`/assets/${request.assetId}`);

  return { error: null };
}

// ─── Approve request (Admin) ─────────────────────────────────────────────────

export async function approveAssetRequest(
  requestId: string,
  _prevState: AssetRequestActionState,
  formData: FormData
): Promise<AssetRequestActionState> {
  const session = await requireRole("ADMIN");

  const parsed = reviewAssetRequestSchema.safeParse({
    reviewNote: formData.get("reviewNote"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const request = await prisma.assetRequest.findUnique({
    where: { id: requestId },
    include: {
      employee: { select: { id: true, userId: true, status: true } },
      asset: { select: { id: true, name: true, assetTag: true, status: true } },
    },
  });

  if (!request) return { error: "Request not found." };
  if (request.status !== "PENDING") {
    return { error: "This request has already been processed." };
  }

  // Re-check employee is still active.
  if (request.employee.status !== "ACTIVE") {
    return { error: "The requesting employee is no longer active." };
  }

  // Re-check asset is still AVAILABLE (race-condition guard, also checked
  // atomically inside the transaction).
  if (request.asset.status !== "AVAILABLE") {
    return {
      error:
        "The asset is no longer available. It may have been assigned or retired.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Mark request approved — idempotency guard.
      const reqUpdate = await tx.assetRequest.updateMany({
        where: { id: requestId, status: "PENDING" },
        data: {
          status: "APPROVED",
          reviewNote: parsed.data.reviewNote ?? null,
          reviewedAt: new Date(),
          reviewedById: session.user.id,
        },
      });
      if (reqUpdate.count === 0) {
        throw new Error("This request has already been processed.");
      }

      // Transition asset to ASSIGNED — atomic race guard.
      const assetUpdate = await tx.asset.updateMany({
        where: { id: request.assetId, status: "AVAILABLE" },
        data: { status: "ASSIGNED" },
      });
      if (assetUpdate.count === 0) {
        throw new Error(
          "The asset is no longer available — it may have just been assigned."
        );
      }

      // Create the assignment record using the existing workflow.
      const assignment = await tx.assetAssignment.create({
        data: {
          assetId: request.assetId,
          employeeId: request.employeeId,
          status: "ACTIVE",
        },
      });

      // Audit: request approved.
      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "ASSET_REQUEST_APPROVED",
          entityType: "AssetRequest",
          entityId: requestId,
          metadata: {
            assetId: request.assetId,
            assetName: request.asset.name,
            assetTag: request.asset.assetTag,
            employeeId: request.employeeId,
            assignmentId: assignment.id,
          },
        },
      });

      // Audit: assignment created.
      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "ASSET_ASSIGNED",
          entityType: "Asset",
          entityId: request.assetId,
          metadata: {
            employeeId: request.employeeId,
            assignmentId: assignment.id,
            viaAssetRequest: requestId,
          },
        },
      });
    });
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? err.message
          : "Could not approve the request. Please try again.",
    };
  }

  // Notify the employee.
  if (request.employee.userId) {
    await createNotification({
      userId: request.employee.userId,
      title: "Asset request approved",
      message: `Your request for ${request.asset.name} (${request.asset.assetTag}) was approved — the asset is now assigned to you.`,
      link: "/my-assets",
    });
  }

  revalidatePath("/asset-requests");
  revalidatePath("/assets");
  revalidatePath(`/assets/${request.assetId}`);
  revalidatePath("/my-assets");
  revalidatePath("/employees");
  revalidatePath("/dashboard");

  return { error: null };
}

// ─── Reject request (Admin) ──────────────────────────────────────────────────

export async function rejectAssetRequest(
  requestId: string,
  _prevState: AssetRequestActionState,
  formData: FormData
): Promise<AssetRequestActionState> {
  const session = await requireRole("ADMIN");

  const parsed = reviewAssetRequestSchema.safeParse({
    reviewNote: formData.get("reviewNote"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const request = await prisma.assetRequest.findUnique({
    where: { id: requestId },
    include: {
      employee: { select: { id: true, userId: true } },
      asset: { select: { id: true, name: true, assetTag: true } },
    },
  });

  if (!request) return { error: "Request not found." };
  if (request.status !== "PENDING") {
    return { error: "This request has already been processed." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const reqUpdate = await tx.assetRequest.updateMany({
        where: { id: requestId, status: "PENDING" },
        data: {
          status: "REJECTED",
          reviewNote: parsed.data.reviewNote ?? null,
          reviewedAt: new Date(),
          reviewedById: session.user.id,
        },
      });
      if (reqUpdate.count === 0) {
        throw new Error("This request has already been processed.");
      }

      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "ASSET_REQUEST_REJECTED",
          entityType: "AssetRequest",
          entityId: requestId,
          metadata: {
            assetId: request.assetId,
            assetName: request.asset.name,
            assetTag: request.asset.assetTag,
            employeeId: request.employeeId,
            reviewNote: parsed.data.reviewNote ?? null,
          },
        },
      });
    });
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? err.message
          : "Could not reject the request. Please try again.",
    };
  }

  // Notify the employee.
  if (request.employee.userId) {
    await createNotification({
      userId: request.employee.userId,
      title: "Asset request rejected",
      message: `Your request for ${request.asset.name} (${request.asset.assetTag}) was not approved.${parsed.data.reviewNote ? ` Reason: ${parsed.data.reviewNote}` : ""}`,
      link: "/my-assets",
    });
  }

  revalidatePath("/asset-requests");
  revalidatePath("/assets");
  revalidatePath(`/assets/${request.assetId}`);
  revalidatePath("/my-assets");
  revalidatePath("/dashboard");

  return { error: null };
}
