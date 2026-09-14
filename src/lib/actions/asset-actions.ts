"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { assertValidAssetTransition } from "@/lib/asset-lifecycle";
import { requireRole } from "@/lib/auth-guards";
import { recordAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { assetFormSchema, type AssetFormInput } from "@/lib/validations/asset";

export type AssetActionState = { error: string | null };

function parseAssetForm(formData: FormData) {
  return assetFormSchema.safeParse(Object.fromEntries(formData.entries()));
}

function toAssetData(input: AssetFormInput) {
  return {
    assetTag: input.assetTag,
    name: input.name,
    type: input.type,
    brand: input.brand ?? null,
    model: input.model ?? null,
    serialNumber: input.serialNumber ?? null,
    processor: input.processor ?? null,
    ram: input.ram ?? null,
    storage: input.storage ?? null,
    purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : null,
    purchasePrice: input.purchasePrice ?? null,
    warrantyExpiry: input.warrantyExpiry ? new Date(input.warrantyExpiry) : null,
    imageUrl: input.imageUrl ?? null,
  };
}

function uniqueConstraintMessage(error: Prisma.PrismaClientKnownRequestError) {
  const target = error.meta?.target;
  const field = Array.isArray(target) ? target.join(", ") : "field";
  if (field.includes("assetTag")) return "An asset with this tag already exists.";
  if (field.includes("serialNumber"))
    return "An asset with this serial number already exists.";
  return "An asset with this value already exists.";
}

export async function createAsset(
  _prevState: AssetActionState,
  formData: FormData
): Promise<AssetActionState> {
  const session = await requireRole("ADMIN");

  const parsed = parseAssetForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  let created;
  try {
    created = await prisma.asset.create({ data: toAssetData(parsed.data) });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: uniqueConstraintMessage(error) };
    }
    return { error: "Could not create the asset. Please try again." };
  }

  await recordAuditLog({
    actorId: session.user.id,
    action: "ASSET_CREATED",
    entityType: "Asset",
    entityId: created.id,
    metadata: { assetTag: created.assetTag },
  });

  revalidatePath("/assets");
  redirect(`/assets/${created.id}`);
}

export async function updateAsset(
  assetId: string,
  _prevState: AssetActionState,
  formData: FormData
): Promise<AssetActionState> {
  const session = await requireRole("ADMIN");

  const existing = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!existing) {
    return { error: "Asset not found." };
  }

  const parsed = parseAssetForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    // Editing asset details never changes status — status only moves
    // through assertValidAssetTransition-backed actions (e.g. Retire).
    await prisma.asset.update({
      where: { id: assetId },
      data: toAssetData(parsed.data),
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: uniqueConstraintMessage(error) };
    }
    return { error: "Could not update the asset. Please try again." };
  }

  await recordAuditLog({
    actorId: session.user.id,
    action: "ASSET_UPDATED",
    entityType: "Asset",
    entityId: assetId,
    metadata: { assetTag: parsed.data.assetTag },
  });

  revalidatePath("/assets");
  revalidatePath(`/assets/${assetId}`);
  redirect(`/assets/${assetId}`);
}

export async function retireAsset(
  assetId: string,
  _prevState: AssetActionState,
  _formData: FormData
): Promise<AssetActionState> {
  const session = await requireRole("ADMIN");

  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) {
    return { error: "Asset not found." };
  }

  try {
    assertValidAssetTransition(asset.status, "RETIRED");
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Invalid transition.",
    };
  }

  await prisma.asset.update({
    where: { id: assetId },
    data: { status: "RETIRED" },
  });

  await recordAuditLog({
    actorId: session.user.id,
    action: "ASSET_RETIRED",
    entityType: "Asset",
    entityId: assetId,
    metadata: { previousStatus: asset.status },
  });

  revalidatePath("/assets");
  revalidatePath(`/assets/${assetId}`);
  return { error: null };
}
