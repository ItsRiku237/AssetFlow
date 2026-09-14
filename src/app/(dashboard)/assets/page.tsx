import Link from "next/link";
import { Boxes, Plus } from "lucide-react";

import { AssetFilters } from "@/components/assets/asset-filters";
import { AssetTable } from "@/components/assets/asset-table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { getAssets, getAssetTypes } from "@/lib/data/assets";
import { requireRole } from "@/lib/auth-guards";
import type { AssetStatus } from "@/types/asset";

const VALID_STATUSES: readonly AssetStatus[] = [
  "AVAILABLE",
  "ASSIGNED",
  "RETURN_REQUESTED",
  "IN_REPAIR",
  "RETIRED",
];

function isAssetStatus(value: string | undefined): value is AssetStatus {
  return !!value && (VALID_STATUSES as readonly string[]).includes(value);
}

interface AssetsPageProps {
  searchParams: Promise<{ q?: string; status?: string; type?: string }>;
}

export default async function AssetsPage({ searchParams }: AssetsPageProps) {
  await requireRole("ADMIN");

  const params = await searchParams;
  const search = params.q?.trim() || undefined;
  const status = isAssetStatus(params.status) ? params.status : undefined;
  const type = params.type?.trim() || undefined;

  const [assets, types] = await Promise.all([
    getAssets({ search, status, type }),
    getAssetTypes(),
  ]);

  const hasActiveFilters = Boolean(search || status || type);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assets"
        description="All company assets and their current status."
        actions={
          <Button asChild>
            <Link href="/assets/new">
              <Plus className="size-4" />
              Add Asset
            </Link>
          </Button>
        }
      />

      <AssetFilters types={types} />

      {assets.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="No assets found"
          description={
            hasActiveFilters
              ? "Try adjusting or clearing your filters."
              : "Add your first asset to get started."
          }
        />
      ) : (
        <AssetTable assets={assets} />
      )}
    </div>
  );
}
