import Link from "next/link";
import { Boxes, PackageSearch } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { AssetStatusBadge, AssetRequestStatusBadge } from "@/components/shared/status-badge";
import { RequestReturnDialog } from "@/components/assets/request-return-dialog";
import { CancelAssetRequestButton } from "@/components/asset-requests/cancel-asset-request-button";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { ActivityRow } from "@/components/dashboard/activity-row";
import { getMyAssets } from "@/lib/data/assets";
import { getMyAssetRequests } from "@/lib/data/asset-requests";
import { requireRole } from "@/lib/auth-guards";
import { formatDate } from "@/lib/utils";

export default async function MyAssetsPage() {
  const session = await requireRole("EMPLOYEE");
  const [assets, myRequests] = await Promise.all([
    getMyAssets(session.user.id),
    getMyAssetRequests(session.user.id),
  ]);

  const pendingRequests = myRequests.filter((r) => r.status === "PENDING");
  const pastRequests = myRequests.filter((r) => r.status !== "PENDING");

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Assets"
        description="Assets in your custody and your asset requests."
      />

      {/* ─── Assigned assets ─────────────────────────────────────── */}
      <DashboardSection
        title="Assigned to me"
        description="Assets currently in your custody."
      >
        {assets.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title="No assets assigned"
            description="Assets assigned to you will appear here. Browse available assets to submit a request."
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
                  </p>
                </Link>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    Since {formatDate(asset.assignedAt)}
                  </span>
                  <AssetStatusBadge status={asset.status} />
                  {asset.status === "ASSIGNED" ? (
                    <RequestReturnDialog assetId={asset.id} />
                  ) : null}
                  {asset.status === "RETURN_REQUESTED" ? (
                    <span className="text-xs text-muted-foreground">
                      Return request pending review
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardSection>

      {/* ─── Pending requests ────────────────────────────────────── */}
      {pendingRequests.length > 0 ? (
        <DashboardSection
          title="Pending requests"
          description="Asset requests awaiting admin review."
        >
          <div className="divide-y divide-border rounded-lg border border-border bg-card">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <Link href={`/assets/${req.assetId}`} className="min-w-0 flex-1">
                  <p className="truncate font-medium">{req.assetName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {req.assetTag} · {req.assetType}
                    {req.reason ? ` · ${req.reason}` : ""}
                  </p>
                </Link>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    Requested {formatDate(req.requestedAt)}
                  </span>
                  <AssetRequestStatusBadge status={req.status} />
                  <CancelAssetRequestButton requestId={req.id} />
                </div>
              </div>
            ))}
          </div>
        </DashboardSection>
      ) : null}

      {/* ─── Past requests ───────────────────────────────────────── */}
      {pastRequests.length > 0 ? (
        <DashboardSection
          title="Request history"
          description="Previously processed asset requests."
        >
          {pastRequests.map((req) => (
            <ActivityRow
              key={req.id}
              primary={req.assetName}
              secondary={
                req.reviewNote
                  ? `${req.assetTag} · ${req.reviewNote}`
                  : req.assetTag
              }
              meta={formatDate(req.requestedAt)}
              badge={<AssetRequestStatusBadge status={req.status} />}
            />
          ))}
        </DashboardSection>
      ) : null}

      {/* ─── Discover prompt ─────────────────────────────────────── */}
      {assets.length === 0 && myRequests.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="Looking for equipment?"
          description="Browse available assets and submit a request to be assigned one."
          action={
            <Link
              href="/available-assets"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-muted/60"
            >
              Browse available assets
            </Link>
          }
        />
      ) : null}
    </div>
  );
}
