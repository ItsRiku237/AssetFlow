import Link from "next/link";
import { Boxes } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { AssetStatusBadge } from "@/components/shared/status-badge";
import { getMyAssets } from "@/lib/data/assets";
import { requireRole } from "@/lib/auth-guards";
import { formatDate } from "@/lib/utils";

export default async function MyAssetsPage() {
  const session = await requireRole("EMPLOYEE");
  const assets = await getMyAssets(session.user.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Assets"
        description="Assets currently in your custody."
      />

      {assets.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="No assets assigned"
          description="Assets assigned to you by an admin will appear here."
        />
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border bg-card">
          {assets.map((asset) => (
            <Link
              key={asset.id}
              href={`/assets/${asset.id}`}
              className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/40"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{asset.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {asset.assetTag} · {asset.type}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  Since {formatDate(asset.assignedAt)}
                </span>
                <AssetStatusBadge status={asset.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
