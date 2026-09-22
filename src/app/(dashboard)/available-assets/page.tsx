import Link from "next/link";
import { Boxes, PackageSearch } from "lucide-react";

import { GlassCard } from "@/components/design-system/glass-card";
import { FadeIn } from "@/components/design-system/fade-in";
import { EmptyState } from "@/components/shared/empty-state";
import { RequestAssetDialog } from "@/components/assets/request-asset-dialog";
import { requireRole } from "@/lib/auth-guards";
import { getRequestableAssets } from "@/lib/data/asset-requests";

export default async function AvailableAssetsPage() {
  const session = await requireRole("EMPLOYEE");
  const assets = await getRequestableAssets(session.user.id);

  return (
    <div className="space-y-6">
      <FadeIn>
        <GlassCard className="relative overflow-hidden px-6 py-5">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full opacity-20 blur-[70px]"
            style={{ background: "radial-gradient(circle, var(--glow-blue), transparent 70%)" }}
          />
          <div className="relative flex items-center gap-3">
            <span className="glow-icon-chip flex size-10 items-center justify-center rounded-xl text-primary">
              <PackageSearch className="size-5" />
            </span>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Browse Assets</h1>
              <p className="text-sm text-muted-foreground">
                {assets.length > 0
                  ? `${assets.length} asset${assets.length !== 1 ? "s" : ""} available to request.`
                  : "Submit a request and an admin will review it."}
              </p>
            </div>
          </div>
        </GlassCard>
      </FadeIn>

      <FadeIn delay={60}>
        {assets.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No assets available"
            description="There are no available assets at the moment, or you already have a pending request for all available ones."
          />
        ) : (
          <GlassCard className="divide-y divide-border/70 overflow-hidden p-0">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-accent/40"
              >
                <Link href={`/assets/${asset.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="glow-icon-chip flex size-8 shrink-0 items-center justify-center rounded-lg text-primary">
                    <Boxes className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{asset.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {asset.assetTag} · {asset.type}
                      {asset.brand ? ` · ${asset.brand}` : ""}
                      {asset.model ? ` ${asset.model}` : ""}
                    </p>
                  </div>
                </Link>
                <RequestAssetDialog assetId={asset.id} />
              </div>
            ))}
          </GlassCard>
        )}
      </FadeIn>
    </div>
  );
}
