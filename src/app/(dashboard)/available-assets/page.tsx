import Link from "next/link";
import { PackageSearch } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { RequestAssetDialog } from "@/components/assets/request-asset-dialog";
import { requireRole } from "@/lib/auth-guards";
import { getRequestableAssets } from "@/lib/data/asset-requests";

export default async function AvailableAssetsPage() {
  const session = await requireRole("EMPLOYEE");
  const assets = await getRequestableAssets(session.user.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Available Assets"
        description="Assets available to request. Submit a request and an admin will review it."
      />

      {assets.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No assets available"
          description="There are no available assets at the moment, or you already have a pending request for all available ones."
        />
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border bg-card">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/40"
            >
              <Link href={`/assets/${asset.id}`} className="min-w-0 flex-1">
                <p className="truncate font-medium">{asset.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {asset.assetTag} · {asset.type}
                  {asset.brand ? ` · ${asset.brand}` : ""}
                  {asset.model ? ` ${asset.model}` : ""}
                </p>
              </Link>
              <RequestAssetDialog assetId={asset.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
