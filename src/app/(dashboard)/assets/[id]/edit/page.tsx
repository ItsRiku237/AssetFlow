import { notFound } from "next/navigation";

import { AssetForm } from "@/components/assets/asset-form";
import { PageHeader } from "@/components/shared/page-header";
import { updateAsset } from "@/lib/actions/asset-actions";
import { requireRole } from "@/lib/auth-guards";
import { getAssetById } from "@/lib/data/assets";

interface EditAssetPageProps {
  params: Promise<{ id: string }>;
}

function toDateInputValue(date: Date | null): string | undefined {
  if (!date) return undefined;
  return date.toISOString().slice(0, 10);
}

export default async function EditAssetPage({ params }: EditAssetPageProps) {
  await requireRole("ADMIN");
  const { id } = await params;

  const asset = await getAssetById(id);
  if (!asset) notFound();

  const updateThisAsset = updateAsset.bind(null, asset.id);

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Asset" description={asset.assetTag} />
      <AssetForm
        action={updateThisAsset}
        submitLabel="Save changes"
        defaultValues={{
          assetTag: asset.assetTag,
          name: asset.name,
          type: asset.type,
          brand: asset.brand ?? undefined,
          model: asset.model ?? undefined,
          serialNumber: asset.serialNumber ?? undefined,
          processor: asset.processor ?? undefined,
          ram: asset.ram ?? undefined,
          storage: asset.storage ?? undefined,
          purchaseDate: toDateInputValue(asset.purchaseDate),
          purchasePrice: asset.purchasePrice ?? undefined,
          warrantyExpiry: toDateInputValue(asset.warrantyExpiry),
          imageUrl: asset.imageUrl ?? undefined,
        }}
      />
    </div>
  );
}
