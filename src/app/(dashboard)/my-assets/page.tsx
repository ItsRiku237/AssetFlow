import Link from "next/link";
import { Boxes, PackageSearch, PackagePlus, Undo2 } from "lucide-react";

import { GlassCard } from "@/components/design-system/glass-card";
import { FadeIn } from "@/components/design-system/fade-in";
import { EmptyState } from "@/components/shared/empty-state";
import {
  AssetStatusBadge,
  AssetRequestStatusBadge,
  ReturnRequestStatusBadge,
} from "@/components/shared/status-badge";
import { RequestReturnDialog } from "@/components/assets/request-return-dialog";
import { CancelAssetRequestButton } from "@/components/asset-requests/cancel-asset-request-button";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { ActivityRow } from "@/components/dashboard/activity-row";
import { getMyAssets } from "@/lib/data/assets";
import { getMyAssetRequests } from "@/lib/data/asset-requests";
import { getMyReturnRequests } from "@/lib/data/return-requests";
import { requireRole } from "@/lib/auth-guards";
import { formatDate } from "@/lib/utils";

export default async function MyAssetsPage() {
  const session = await requireRole("EMPLOYEE");
  const [assets, myRequests, myReturnRequests] = await Promise.all([
    getMyAssets(session.user.id),
    getMyAssetRequests(session.user.id),
    getMyReturnRequests(session.user.id),
  ]);

  const pendingRequests = myRequests.filter((r) => r.status === "PENDING");
  const pastRequests = myRequests.filter((r) => r.status !== "PENDING");

  return (
    <div className="space-y-6">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <FadeIn>
        <GlassCard className="relative overflow-hidden px-6 py-5">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full opacity-20 blur-[70px]"
            style={{ background: "radial-gradient(circle, var(--glow-cyan), transparent 70%)" }}
          />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="glow-icon-chip flex size-10 items-center justify-center rounded-xl text-primary">
                <Boxes className="size-5" />
              </span>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">My Assets</h1>
                <p className="text-sm text-muted-foreground">
                  Assets in your custody and your asset requests.
                </p>
              </div>
            </div>
            <Link
              href="/available-assets"
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
            >
              <PackageSearch className="size-3.5" />
              Browse available assets
            </Link>
          </div>
        </GlassCard>
      </FadeIn>

      {/* ── Assigned assets ───────────────────────────────────── */}
      <FadeIn delay={60}>
        <DashboardSection
          title="Assigned to me"
          description="Assets currently in your custody."
        >
          {assets.length === 0 ? (
            <EmptyState
              icon={Boxes}
              title="No assets assigned"
              description="Assets assigned to you will appear here."
            />
          ) : (
            <div className="divide-y divide-border/70">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="-mx-1 flex flex-wrap items-center justify-between gap-3 rounded-md px-1 py-3 text-sm transition-colors hover:bg-accent/40"
                >
                  <Link href={`/assets/${asset.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="glow-icon-chip flex size-8 shrink-0 items-center justify-center rounded-lg text-primary">
                      <Boxes className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{asset.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {asset.assetTag} · Since {formatDate(asset.assignedAt)}
                      </p>
                    </div>
                  </Link>
                  <div className="flex shrink-0 items-center gap-2">
                    <AssetStatusBadge status={asset.status} />
                    {asset.status === "ASSIGNED" ? (
                      <RequestReturnDialog assetId={asset.id} />
                    ) : null}
                    {asset.status === "RETURN_REQUESTED" ? (
                      <span className="text-xs text-muted-foreground">Return pending</span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardSection>
      </FadeIn>

      {/* ── Pending asset requests ─────────────────────────────── */}
      {pendingRequests.length > 0 ? (
        <FadeIn delay={120}>
          <DashboardSection
            title="Pending requests"
            description="Asset requests awaiting admin review."
          >
            <div className="divide-y divide-border/70">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="-mx-1 flex flex-wrap items-center justify-between gap-3 rounded-md px-1 py-3 text-sm"
                >
                  <Link href={`/assets/${req.assetId}`} className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="glow-icon-chip flex size-8 shrink-0 items-center justify-center rounded-lg text-primary">
                      <PackagePlus className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{req.assetName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {req.assetTag} · {req.assetType}
                        {req.reason ? ` · ${req.reason}` : ""}
                      </p>
                    </div>
                  </Link>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(req.requestedAt)}
                    </span>
                    <AssetRequestStatusBadge status={req.status} />
                    <CancelAssetRequestButton requestId={req.id} />
                  </div>
                </div>
              ))}
            </div>
          </DashboardSection>
        </FadeIn>
      ) : null}

      {/* ── Past asset requests ────────────────────────────────── */}
      {pastRequests.length > 0 ? (
        <FadeIn delay={180}>
          <DashboardSection
            title="Request history"
            description="Previously processed asset requests."
          >
            {pastRequests.map((req) => (
              <ActivityRow
                key={req.id}
                primary={req.assetName}
                secondary={req.reviewNote ? `${req.assetTag} · ${req.reviewNote}` : req.assetTag}
                meta={formatDate(req.requestedAt)}
                badge={<AssetRequestStatusBadge status={req.status} />}
              />
            ))}
          </DashboardSection>
        </FadeIn>
      ) : null}

      {/* ── My return requests ─────────────────────────────────── */}
      {myReturnRequests.length > 0 ? (
        <FadeIn delay={240}>
          <DashboardSection
            title="My return requests"
            description="Return requests you have submitted."
          >
            {myReturnRequests.map((req) => (
              <ActivityRow
                key={req.id}
                icon={Undo2}
                primary={req.assetName}
                secondary={`${req.assetTag} · ${req.reason}`}
                meta={formatDate(req.requestedAt)}
                badge={<ReturnRequestStatusBadge status={req.status} />}
              />
            ))}
          </DashboardSection>
        </FadeIn>
      ) : null}

      {/* ── Empty state ────────────────────────────────────────── */}
      {assets.length === 0 && myRequests.length === 0 && myReturnRequests.length === 0 ? (
        <FadeIn delay={60}>
          <EmptyState
            icon={PackageSearch}
            title="Nothing here yet"
            description="Browse available assets and submit a request to get started."
            action={
              <Link
                href="/available-assets"
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20"
              >
                <PackageSearch className="size-4" />
                Browse available assets
              </Link>
            }
          />
        </FadeIn>
      ) : null}
    </div>
  );
}
