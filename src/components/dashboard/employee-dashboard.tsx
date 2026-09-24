import Link from "next/link";
import {
  Boxes,
  History,
  PackageSearch,
  Undo2,
} from "lucide-react";

import { ActivityRow } from "@/components/dashboard/activity-row";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { StatCard } from "@/components/dashboard/stat-card";
import { FadeIn } from "@/components/design-system/fade-in";
import { GlassCard } from "@/components/design-system/glass-card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  AssetStatusBadge,
  ReturnRequestStatusBadge,
} from "@/components/shared/status-badge";
import { getEmployeeDashboardData } from "@/lib/data/dashboard";
import { cn, formatDate } from "@/lib/utils";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export async function EmployeeDashboard({
  userId,
  userName,
}: {
  userId: string;
  userName?: string | null;
}) {
  const data = await getEmployeeDashboardData(userId);

  return (
    <div className="space-y-5">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <FadeIn>
        <GlassCard className="relative overflow-hidden">
          {/* Glow decorations */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-grid-pattern opacity-20 [mask-image:linear-gradient(to_bottom,#000,transparent)]" />
            <div
              className="animate-af-glow-pulse absolute -right-16 -top-16 size-64 rounded-full opacity-30 blur-[80px]"
              style={{
                background:
                  "radial-gradient(circle, var(--glow-cyan), transparent 70%)",
              }}
            />
            <div
              className="absolute -bottom-16 left-8 size-48 rounded-full opacity-20 blur-[70px]"
              style={{
                background:
                  "radial-gradient(circle, var(--glow-purple), transparent 70%)",
              }}
            />
          </div>

          <div className="relative flex flex-wrap items-center justify-between gap-4 px-6 py-8 sm:px-8">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {greeting()}
              </p>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Welcome back
                {userName ? (
                  <>
                    {", "}
                    <span className="text-gradient-brand">{userName}</span>
                  </>
                ) : null}{" "}
                👋
              </h1>
              <p className="text-sm text-muted-foreground">
                {data.assignedAssets.length > 0
                  ? `You have ${data.assignedAssets.length} asset${data.assignedAssets.length !== 1 ? "s" : ""} in your custody.`
                  : "Your asset portal — manage your equipment and requests here."}
              </p>
            </div>

            <Link
              href="/available-assets"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
            >
              <PackageSearch className="size-4" />
              Browse assets
            </Link>
          </div>
        </GlassCard>
      </FadeIn>

      {/* ── Stats ────────────────────────────────────────────── */}
      <FadeIn delay={60}>
        <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
          <StatCard
            label="Assets in Custody"
            value={data.assignedAssets.length}
            icon={Boxes}
          />
          <StatCard
            label="Pending Returns"
            value={data.pendingReturnRequests.length}
            icon={Undo2}
            tone={data.pendingReturnRequests.length > 0 ? "warning" : "default"}
          />
        </div>
      </FadeIn>

      {/* ── Assigned assets ───────────────────────────────────── */}
      <FadeIn delay={90}>
        <DashboardSection
          title="My Assigned Assets"
          description="Assets currently in your custody."
          viewAllHref="/my-assets"
        >
          {data.assignedAssets.length === 0 ? (
            <EmptyState
              icon={Boxes}
              title="No assets assigned"
              description="Assets assigned to you by an admin will appear here."
              action={
                <Link
                  href="/available-assets"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"
                >
                  <PackageSearch className="size-3.5" />
                  Browse available assets
                </Link>
              }
            />
          ) : (
            <div className="space-y-0.5">
              {data.assignedAssets.map((a) => (
                <Link
                  key={a.id}
                  href={`/assets/${a.assetId}`}
                  className={cn(
                    "-mx-1 flex items-center justify-between gap-3 rounded-md px-2 py-2.5 text-sm transition-colors",
                    "hover:bg-primary/5 hover:text-foreground"
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="glow-icon-chip flex size-8 shrink-0 items-center justify-center rounded-lg text-primary">
                      <Boxes className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{a.assetName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {a.assetTag} · Since {formatDate(a.assignedAt)}
                      </p>
                    </div>
                  </div>
                  <AssetStatusBadge status={a.status} />
                </Link>
              ))}
            </div>
          )}
        </DashboardSection>
      </FadeIn>

      {/* ── Pending returns ───────────────────────────────────── */}
      {data.pendingReturnRequests.length > 0 ? (
        <FadeIn delay={120}>
          <DashboardSection
            title="Pending Return Requests"
            description="Requests waiting on admin review."
            viewAllHref="/return-requests"
          >
            {data.pendingReturnRequests.map((r) => (
              <ActivityRow
                key={r.id}
                icon={Undo2}
                primary={r.assetName}
                meta={formatDate(r.requestedAt)}
                badge={<ReturnRequestStatusBadge status={r.status} />}
              />
            ))}
          </DashboardSection>
        </FadeIn>
      ) : null}

      {/* ── Recent activity ───────────────────────────────────── */}
      <FadeIn delay={150}>
        <DashboardSection
          title="Recent Activity"
          description="Your recent asset custody history."
        >
          {data.recentActivity.length === 0 ? (
            <EmptyState
              icon={History}
              title="No activity yet"
              description="Your assignment history will appear here."
            />
          ) : (
            data.recentActivity.map((a) => (
              <ActivityRow
                key={a.id}
                icon={a.returnedAt ? Undo2 : Boxes}
                primary={a.assetName}
                secondary={a.returnedAt ? "Returned" : "Assigned"}
                meta={formatDate(a.returnedAt ?? a.assignedAt)}
              />
            ))
          )}
        </DashboardSection>
      </FadeIn>
    </div>
  );
}
