"use server";

import { revalidatePath } from "next/cache";

import { assertValidAssetTransition } from "@/lib/asset-lifecycle";
import { requireRole } from "@/lib/auth-guards";
import { DemoScopeError, assertDemoAssetScope, assertDemoEmployeeScope } from "@/lib/demo";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { assignAssetSchema } from "@/lib/validations/assignment";

export type AssignAssetState = { error: string | null };

export async function assignAsset(
  assetId: string,
  _prevState: AssignAssetState,
  formData: FormData
): Promise<AssignAssetState> {
  const session = await requireRole("ADMIN");

  const parsed = assignAssetSchema.safeParse({
    employeeId: formData.get("employeeId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { employeeId } = parsed.data;

  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) {
    return { error: "Asset not found." };
  }

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true, status: true, userId: true },
  });
  if (!employee) {
    return { error: "Employee not found." };
  }
  if (employee.status === "INACTIVE") {
    return { error: "This employee is deactivated and cannot be assigned assets." };
  }

  // A demo admin may only link demo assets to the demo employee — never
  // a real asset or a real employee, in either direction.
  try {
    await assertDemoAssetScope(session.user.email, assetId);
    await assertDemoEmployeeScope(session.user.email, employeeId);
  } catch (error) {
    if (error instanceof DemoScopeError) {
      return { error: error.message };
    }
    throw error;
  }

  // Fail fast with a specific message for the common case (checked
  // again atomically below to guard against a concurrent change).
  try {
    assertValidAssetTransition(asset.status, "ASSIGNED");
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "This asset cannot be assigned right now.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Conditional update: only succeeds if the asset is still
      // AVAILABLE at the moment of the write. This is what actually
      // prevents a race condition — two concurrent assignment
      // attempts can't both succeed, since only one `updateMany`
      // will match a row.
      const result = await tx.asset.updateMany({
        where: { id: assetId, status: "AVAILABLE" },
        data: { status: "ASSIGNED" },
      });
      if (result.count === 0) {
        throw new Error(
          "This asset was just assigned or is no longer available."
        );
      }

      const assignment = await tx.assetAssignment.create({
        data: { assetId, employeeId, status: "ACTIVE" },
      });

      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "ASSET_ASSIGNED",
          entityType: "Asset",
          entityId: assetId,
          metadata: { employeeId, assignmentId: assignment.id },
        },
      });
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not assign the asset. Please try again.",
    };
  }

  if (employee.userId) {
    await createNotification({
      userId: employee.userId,
      title: "Asset assigned to you",
      message: `${asset.name} (${asset.assetTag}) has been assigned to you.`,
      link: `/assets/${assetId}`,
    });
  }

  revalidatePath("/assets");
  revalidatePath(`/assets/${assetId}`);
  revalidatePath("/employees");
  revalidatePath(`/employees/${employeeId}`);
  revalidatePath("/dashboard");

  return { error: null };
}
