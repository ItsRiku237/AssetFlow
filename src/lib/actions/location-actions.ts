"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth-guards";
import { recordAuditLog } from "@/lib/audit";
import { DemoScopeError, assertDemoAssetScope } from "@/lib/demo";
import { prisma } from "@/lib/prisma";
import { locationFormSchema } from "@/lib/validations/location";

export type LocationActionState = { error: string | null };

/**
 * Creates or updates the physical location for an asset.
 * Uses upsert so the same form can handle both "set" and "edit".
 */
export async function upsertAssetLocation(
  assetId: string,
  _prevState: LocationActionState,
  formData: FormData
): Promise<LocationActionState> {
  const session = await requireRole("ADMIN");

  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    select: { id: true, assetTag: true },
  });
  if (!asset) return { error: "Asset not found." };

  try {
    await assertDemoAssetScope(session.user.email, assetId);
  } catch (error) {
    if (error instanceof DemoScopeError) {
      return { error: error.message };
    }
    throw error;
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = locationFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { locationType, building, floor, room, desk, description } = parsed.data;

  // For OFFICE we store office-specific fields; for others we clear them
  // and only keep description, so stale data never leaks across type changes.
  const locationData =
    locationType === "OFFICE"
      ? {
          locationType,
          building: building ?? null,
          floor: floor ?? null,
          room: room ?? null,
          desk: desk ?? null,
          description: null,
        }
      : {
          locationType,
          building: null,
          floor: null,
          room: null,
          desk: null,
          description: description ?? null,
        };

  const existing = await prisma.assetLocation.findUnique({
    where: { assetId },
    select: { id: true },
  });

  await prisma.assetLocation.upsert({
    where: { assetId },
    create: { assetId, ...locationData },
    update: { ...locationData },
  });

  await recordAuditLog({
    actorId: session.user.id,
    action: existing ? "ASSET_LOCATION_UPDATED" : "ASSET_LOCATION_SET",
    entityType: "Asset",
    entityId: assetId,
    metadata: {
      assetTag: asset.assetTag,
      locationType,
      ...(locationType === "OFFICE"
        ? { building, floor, room, desk }
        : { description }),
    },
  });

  revalidatePath(`/assets/${assetId}`);
  revalidatePath("/assets");
  return { error: null };
}

/**
 * Removes the physical location record for an asset entirely.
 */
export async function removeAssetLocation(
  assetId: string,
  _prevState: LocationActionState,
  _formData: FormData
): Promise<LocationActionState> {
  const session = await requireRole("ADMIN");

  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    select: { id: true, assetTag: true },
  });
  if (!asset) return { error: "Asset not found." };

  try {
    await assertDemoAssetScope(session.user.email, assetId);
  } catch (error) {
    if (error instanceof DemoScopeError) {
      return { error: error.message };
    }
    throw error;
  }

  // deleteMany is safe — it is a no-op if there's no location record.
  await prisma.assetLocation.deleteMany({ where: { assetId } });

  await recordAuditLog({
    actorId: session.user.id,
    action: "ASSET_LOCATION_REMOVED",
    entityType: "Asset",
    entityId: assetId,
    metadata: { assetTag: asset.assetTag },
  });

  revalidatePath(`/assets/${assetId}`);
  revalidatePath("/assets");
  return { error: null };
}
