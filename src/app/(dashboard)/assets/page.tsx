import Link from "next/link";
import { Boxes, Plus } from "lucide-react";

import { AssetFilters } from "@/components/assets/asset-filters";
import { AssetTable } from "@/components/assets/asset-table";
import { FadeIn } from "@/components/design-system/fade-in";
import { PageHero } from "@/components/design-system/page-hero";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { GlassCard } from "@/components/design-system/glass-card";
import { getAssets, getAssetTypes } from "@/lib/data/assets";
import { requireRole } from "@/lib/auth-guards";
import { RAM_OPTIONS } from "@/lib/hardware-specs";
import type { AssetStatus, LocationType } from "@/types/asset";

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

const VALID_LOCATION_TYPES: readonly LocationType[] = ["OFFICE", "REMOTE", "OTHER"];
function isLocationType(value: string | undefined): value is LocationType {
  return !!value && (VALID_LOCATION_TYPES as readonly string[]).includes(value);
}
function isValidRam(value: string | undefined): boolean {
  return !!value && (RAM_OPTIONS as readonly string[]).includes(value);
}

interface AssetsPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    type?: string;
    locationType?: string;
    ram?: string;
  }>;
}

export default async function AssetsPage({ searchParams }: AssetsPageProps) {
  await requireRole("ADMIN");

  const params = await searchParams;
  const search = params.q?.trim() || undefined;
  const status = isAssetStatus(params.status) ? params.status : undefined;
  const type = params.type?.trim() || undefined;
  const locationType = isLocationType(params.locationType) ? params.locationType : undefined;
  const ram = isValidRam(params.ram) ? params.ram : undefined;

  const [assets, types] = await Promise.all([
    getAssets({ search, status, type, locationType, ram }),
    getAssetTypes(),
  ]);

  const hasActiveFilters = Boolean(search || status || type || locationType || ram);

  return (
    <div className="data-page-with-controls has-sticky-filter space-y-5">
      {/* ── Hero ────────────────────────────────────────────────── */}
      <FadeIn>
        <PageHero imageSrc="/images/assets-hero.webp" className="px-6 py-8 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1.5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Asset Management
              </p>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Company{" "}
                <span className="text-gradient-brand">Assets</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Track, assign, and manage all company hardware and equipment.
              </p>
            </div>
            <Button asChild size="sm">
              <Link href="/assets/new">
                <Plus className="size-4" />
                Add Asset
              </Link>
            </Button>
          </div>
        </PageHero>
      </FadeIn>

      {/* ── Filters ─────────────────────────────────────────────── */}
      <div className="sticky-control-bar">
        <GlassCard className="p-3 sm:p-4">
          <AssetFilters types={types} />
        </GlassCard>
      </div>

      {/* ── Table / empty ───────────────────────────────────────── */}
      <FadeIn delay={120}>
        {assets.length === 0 ? (
          <GlassCard className="p-6">
            <EmptyState
              icon={Boxes}
              title="No assets found"
              description={
                hasActiveFilters
                  ? "Try adjusting or clearing your filters."
                  : "Add your first asset to get started."
              }
            />
          </GlassCard>
        ) : (
          <GlassCard className="overflow-visible rounded-xl">
            <AssetTable assets={assets} />
          </GlassCard>
        )}
      </FadeIn>
    </div>
  );
}
