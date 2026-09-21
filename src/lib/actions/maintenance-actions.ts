"use server";

import { revalidatePath } from "next/cache";

import { assertValidAssetTransition } from "@/lib/asset-lifecycle";
import { requireRole } from "@/lib/auth-guards";
import { recordAuditLog } from "@/lib/audit";
import { DemoScopeError, assertDemoAssetScope } from "@/lib/demo";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import {
  completeMaintenanceRecordSchema,
  createMaintenanceRecordSchema,
  updateMaintenanceRecordSchema,
} from "@/lib/validations/maintenance";

export type MaintenanceActionState = { error: string | null };

function revalidateMaintenancePaths(assetId: string) {
  revalidatePath("/repairs");
  revalidatePath("/assets");
  revalidatePath(`/assets/${assetId}`);
  revalidatePath("/dashboard");
}

// ---------------------------------------------------------------------------
// Admin: log a maintenance record for an asset already IN_REPAIR
// ---------------------------------------------------------------------------
//
// Note: the ASSIGNED/RETURN_REQUESTED -> IN_REPAIR transition itself is
// already handled by approveReturnRequest in return-request-actions.ts
// (an admin approves a return request and chooses "In Repair" as the
// asset's next status). This action does not move an asset into
// IN_REPAIR — it only records what's being serviced once it's there,
// and later closes that record out via completeMaintenanceRecord.

export async function createMaintenanceRecord(
  assetId: string,
  _prevState: MaintenanceActionState,
  formData: FormData
): Promise<MaintenanceActionState> {
  const session = await requireRole("ADMIN");

  const parsed = createMaintenanceRecordSchema.safeParse({
    issue: formData.get("issue"),
    description: formData.get("description"),
    vendor: formData.get("vendor"),
    cost: formData.get("cost"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { issue, description, vendor, cost } = parsed.data;

  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) {
    return { error: "Asset not found." };
  }
  if (asset.status !== "IN_REPAIR") {
    return {
      error: "Only an asset currently in repair can have a maintenance record started.",
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

  const existingActive = await prisma.maintenanceRecord.findFirst({
    where: { assetId, completedAt: null },
  });
  if (existingActive) {
    return {
      error: "This asset already has an active maintenance record.",
    };
  }

  let record;
  try {
    record = await prisma.maintenanceRecord.create({
      data: {
        assetId,
        issue,
        description: description ?? null,
        vendor: vendor ?? null,
        cost: cost ?? null,
      },
    });
  } catch {
    return {
      error: "Could not create the maintenance record. Please try again.",
    };
  }

  await recordAuditLog({
    actorId: session.user.id,
    action: "MAINTENANCE_RECORD_CREATED",
    entityType: "MaintenanceRecord",
    entityId: record.id,
    metadata: { assetId, issue },
  });

  revalidateMaintenancePaths(assetId);

  return { error: null };
}

// ---------------------------------------------------------------------------
// Admin: update an active (not yet completed) maintenance record
// ---------------------------------------------------------------------------

export async function updateMaintenanceRecord(
  recordId: string,
  _prevState: MaintenanceActionState,
  formData: FormData
): Promise<MaintenanceActionState> {
  const session = await requireRole("ADMIN");

  const parsed = updateMaintenanceRecordSchema.safeParse({
    issue: formData.get("issue"),
    description: formData.get("description"),
    vendor: formData.get("vendor"),
    cost: formData.get("cost"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { issue, description, vendor, cost } = parsed.data;

  const record = await prisma.maintenanceRecord.findUnique({
    where: { id: recordId },
  });
  if (!record) {
    return { error: "Maintenance record not found." };
  }
  if (record.completedAt !== null) {
    return { error: "Completed maintenance records can't be edited." };
  }

  try {
    await assertDemoAssetScope(session.user.email, record.assetId);
  } catch (error) {
    if (error instanceof DemoScopeError) {
      return { error: error.message };
    }
    throw error;
  }

  try {
    await prisma.maintenanceRecord.update({
      where: { id: recordId },
      data: {
        issue,
        description: description ?? null,
        vendor: vendor ?? null,
        cost: cost ?? null,
      },
    });
  } catch {
    return {
      error: "Could not update the maintenance record. Please try again.",
    };
  }

  await recordAuditLog({
    actorId: session.user.id,
    action: "MAINTENANCE_RECORD_UPDATED",
    entityType: "MaintenanceRecord",
    entityId: recordId,
    metadata: { assetId: record.assetId, issue },
  });

  revalidateMaintenancePaths(record.assetId);

  return { error: null };
}

// ---------------------------------------------------------------------------
// Admin: complete a repair — closes the maintenance record and moves
// the asset IN_REPAIR -> AVAILABLE atomically.
// ---------------------------------------------------------------------------

export async function completeMaintenanceRecord(
  recordId: string,
  _prevState: MaintenanceActionState,
  formData: FormData
): Promise<MaintenanceActionState> {
  const session = await requireRole("ADMIN");

  const parsed = completeMaintenanceRecordSchema.safeParse({
    resolution: formData.get("resolution"),
    cost: formData.get("cost"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { resolution, cost } = parsed.data;

  const record = await prisma.maintenanceRecord.findUnique({
    where: { id: recordId },
  });
  if (!record) {
    return { error: "Maintenance record not found." };
  }
  if (record.completedAt !== null) {
    return { error: "This maintenance record has already been completed." };
  }

  const asset = await prisma.asset.findUnique({
    where: { id: record.assetId },
  });
  if (!asset) {
    return { error: "Asset not found." };
  }

  try {
    await assertDemoAssetScope(session.user.email, asset.id);
  } catch (error) {
    if (error instanceof DemoScopeError) {
      return { error: error.message };
    }
    throw error;
  }

  try {
    assertValidAssetTransition(asset.status, "AVAILABLE");
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "This asset can't be completed from its current status.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const recordUpdate = await tx.maintenanceRecord.updateMany({
        where: { id: recordId, completedAt: null },
        data: {
          completedAt: new Date(),
          resolution,
          ...(cost !== undefined ? { cost } : {}),
        },
      });
      if (recordUpdate.count === 0) {
        throw new Error(
          "This maintenance record was already completed — refresh and try again."
        );
      }

      const assetUpdate = await tx.asset.updateMany({
        where: { id: asset.id, status: "IN_REPAIR" },
        data: { status: "AVAILABLE" },
      });
      if (assetUpdate.count === 0) {
        throw new Error(
          "This asset's status just changed — refresh and try again."
        );
      }

      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "MAINTENANCE_COMPLETED",
          entityType: "MaintenanceRecord",
          entityId: recordId,
          metadata: { assetId: asset.id, resolution },
        },
      });
      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "ASSET_STATUS_CHANGED",
          entityType: "Asset",
          entityId: asset.id,
          metadata: { from: "IN_REPAIR", to: "AVAILABLE" },
        },
      });
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not complete the repair. Please try again.",
    };
  }

  const lastAssignment = await prisma.assetAssignment.findFirst({
    where: { assetId: asset.id },
    orderBy: { assignedAt: "desc" },
    include: { employee: { select: { userId: true } } },
  });
  if (lastAssignment?.employee.userId) {
    await createNotification({
      userId: lastAssignment.employee.userId,
      title: "Asset repair completed",
      message: `${asset.name} (${asset.assetTag}) has been repaired and is now available.`,
      link: `/assets/${asset.id}`,
    });
  }

  revalidateMaintenancePaths(asset.id);

  return { error: null };
}
