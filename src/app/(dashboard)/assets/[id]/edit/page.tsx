import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AssetForm } from "@/components/assets/asset-form";
import { FadeIn } from "@/components/design-system/fade-in";
import { GlassCard } from "@/components/design-system/glass-card";
import { PageHero } from "@/components/design-system/page-hero";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-5">
      <FadeIn>
        <PageHero imageSrc="/images/assets-hero.webp" className="px-6 py-7 sm:px-8">
          <div className="space-y-1.5">
            <Button variant="ghost" size="sm" asChild className="-ml-1 mb-2 text-muted-foreground">
              <Link href={`/assets/${asset.id}`}>
                <ArrowLeft className="size-3.5" />
                Back to Asset
              </Link>
            </Button>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {asset.assetTag}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Edit <span className="text-gradient-brand">{asset.name}</span>
            </h1>
          </div>
        </PageHero>
      </FadeIn>

      <FadeIn delay={60}>
        <GlassCard className="p-6">
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
              storageType: asset.storageType ?? undefined,
              purchaseDate: toDateInputValue(asset.purchaseDate),
              purchasePrice: asset.purchasePrice ?? undefined,
              warrantyExpiry: toDateInputValue(asset.warrantyExpiry),
              imageUrl: asset.imageUrl ?? undefined,
            }}
          />
        </GlassCard>
      </FadeIn>
    </div>
  );
}
