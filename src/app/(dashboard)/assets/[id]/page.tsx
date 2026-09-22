import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Boxes,
  Clock,
  Cpu,
  HardDrive,
  Headphones,
  History,
  Keyboard,
  Laptop,
  Mic,
  Monitor,
  Mouse,
  Network,
  Package,
  Phone,
  Printer,
  Router,
  Server,
  Tablet,
  Tv,
  Undo2,
  Video,
  Volume2,
  Wrench,
} from "lucide-react";

import { AssetActions } from "@/components/assets/asset-actions";
import { AssetLocationCard } from "@/components/assets/asset-location-card";
import { AssetLocationForm } from "@/components/assets/asset-location-form";
import { AssetTimeline } from "@/components/assets/asset-timeline";
import { RequestAssetDialog } from "@/components/assets/request-asset-dialog";
import { RequestReturnDialog } from "@/components/assets/request-return-dialog";
import { ActivityRow } from "@/components/dashboard/activity-row";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { FadeIn } from "@/components/design-system/fade-in";
import { GlassCard } from "@/components/design-system/glass-card";
import { PageHero } from "@/components/design-system/page-hero";
import { EmptyState } from "@/components/shared/empty-state";
import { InfoGrid } from "@/components/shared/info-grid";
import {
  AssetStatusBadge,
  ReturnRequestStatusBadge,
} from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth-guards";
import {
  getAssetTimeline,
  getAssetTimelineForEmployee,
} from "@/lib/data/asset-timeline";
import { getAssetById, isAssetAssignedToUser } from "@/lib/data/assets";
import { getEmployees } from "@/lib/data/employees";
import { isHardwareAsset, formatStorageSummary } from "@/lib/hardware-specs";
import { prisma } from "@/lib/prisma";
import { cn, formatDate } from "@/lib/utils";

// ── Asset type → icon mapping ─────────────────────────────────────────────────

const TYPE_ICONS: Record<string, React.ElementType> = {
  Laptop: Laptop,
  Desktop: Monitor,
  "Desktop PC": Monitor,
  Monitor: Monitor,
  Smartphone: Phone,
  Phone: Phone,
  Tablet: Tablet,
  Printer: Printer,
  Scanner: Printer,
  Keyboard: Keyboard,
  Mouse: Mouse,
  Speaker: Volume2,
  Headphones: Headphones,
  Webcam: Video,
  Microphone: Mic,
  Server: Server,
  Router: Router,
  Switch: Network,
  UPS: Cpu,
  Projector: Tv,
  "Graphics Card": Cpu,
  "RAM Module": Cpu,
  SSD: HardDrive,
  "External HDD": HardDrive,
  "USB Hub": HardDrive,
  "Docking Station": HardDrive,
  Accessory: Package,
  Other: Boxes,
};

function getAssetIcon(type?: string | null, name?: string | null): React.ElementType {
  if (type && TYPE_ICONS[type]) {
    return TYPE_ICONS[type];
  }
  const combined = `${type ?? ""} ${name ?? ""}`.toLowerCase();
  if (combined.includes("laptop") || combined.includes("macbook") || combined.includes("thinkpad") || combined.includes("notebook") || combined.includes("nitro") || combined.includes("zenbook") || combined.includes("rog")) return Laptop;
  if (combined.includes("desktop") || combined.includes("pc") || combined.includes("workstation") || combined.includes("imac")) return Monitor;
  if (combined.includes("monitor") || combined.includes("display") || combined.includes("screen")) return Monitor;
  if (combined.includes("printer") || combined.includes("scanner") || combined.includes("laserjet") || combined.includes("deskjet")) return Printer;
  if (combined.includes("phone") || combined.includes("iphone") || combined.includes("mobile") || combined.includes("android") || combined.includes("pixel") || combined.includes("galaxy")) return Phone;
  if (combined.includes("tablet") || combined.includes("ipad") || combined.includes("surface")) return Tablet;
  if (combined.includes("keyboard")) return Keyboard;
  if (combined.includes("mouse") || combined.includes("trackpad")) return Mouse;
  if (combined.includes("server") || combined.includes("blade") || combined.includes("rack")) return Server;
  if (combined.includes("router") || combined.includes("switch") || combined.includes("access point") || combined.includes("network")) return Router;
  if (combined.includes("headphone") || combined.includes("headset") || combined.includes("earphone") || combined.includes("airpod")) return Headphones;
  if (combined.includes("speaker") || combined.includes("audio") || combined.includes("sound")) return Volume2;
  if (combined.includes("webcam") || combined.includes("camera")) return Video;
  if (combined.includes("mic")) return Mic;
  if (combined.includes("drive") || combined.includes("hdd") || combined.includes("ssd") || combined.includes("storage") || combined.includes("dock") || combined.includes("hub")) return HardDrive;
  if (combined.includes("gpu") || combined.includes("cpu") || combined.includes("ram") || combined.includes("ups")) return Cpu;
  return Boxes;
}

function AssetTypeIcon({ type, name, className }: { type: string; name?: string; className?: string }) {
  return React.createElement(getAssetIcon(type, name), { className: cn("size-6", className) });
}

interface AssetDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AssetDetailPage({ params }: AssetDetailPageProps) {
  const session = await requireAuth();
  const { id } = await params;

  const asset = await getAssetById(id);
  if (!asset) notFound();

  const isAdmin =
    session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";

  let ownsAsset = false;
  let canRequestAsset = false;
  let hasPendingRequest = false;

  if (!isAdmin) {
    if (asset.status === "AVAILABLE") {
      canRequestAsset = true;
      const employee = await prisma.employee.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
      if (employee) {
        const pending = await prisma.assetRequest.findFirst({
          where: { assetId: id, employeeId: employee.id, status: "PENDING" },
        });
        hasPendingRequest = !!pending;
      }
    } else {
      ownsAsset = await isAssetAssignedToUser(id, session.user.id);
      if (!ownsAsset) notFound();
    }
  }

  const [assignableEmployees, timeline] = await Promise.all([
    isAdmin && asset.status === "AVAILABLE"
      ? getEmployees({ status: "ACTIVE" }).then((list) =>
          list.map((e) => ({ id: e.id, name: e.name, department: e.department ?? "—" }))
        )
      : Promise.resolve([] as { id: string; name: string; department: string }[]),
    isAdmin
      ? getAssetTimeline(id)
      : getAssetTimelineForEmployee(id, session.user.id),
  ]);

  const hardwareItems = isHardwareAsset(asset.type)
    ? [
        ...(asset.processor ? [{ label: "Processor", value: asset.processor }] : []),
        ...(asset.ram ? [{ label: "RAM", value: asset.ram }] : []),
        ...(asset.storage || asset.storageType
          ? [
              {
                label: "Storage",
                value: formatStorageSummary(asset.storage, asset.storageType) ?? "—",
              },
            ]
          : []),
      ]
    : [];

  // ── Action button ───────────────────────────────────────────────────────────
  const actionNode = isAdmin ? (
    <AssetActions
      assetId={asset.id}
      status={asset.status}
      assignableEmployees={assignableEmployees}
    />
  ) : ownsAsset && asset.status === "ASSIGNED" ? (
    <RequestReturnDialog assetId={asset.id} />
  ) : canRequestAsset && !hasPendingRequest ? (
    <RequestAssetDialog assetId={asset.id} />
  ) : canRequestAsset && hasPendingRequest ? (
    <span className="text-sm text-muted-foreground">Request pending review</span>
  ) : undefined;

  return (
    <div className="space-y-5">
      {/* ── Hero ────────────────────────────────────────────────── */}
      <FadeIn>
        <PageHero imageSrc="/images/asset-detail-hero.webp" className="px-6 py-8 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="-ml-1 mb-1 text-muted-foreground"
              >
                <Link href="/assets">
                  <ArrowLeft className="size-3.5" />
                  Assets
                </Link>
              </Button>

              <div className="flex items-center gap-3">
                {/* Asset image or icon chip */}
                <Avatar className="size-14 shrink-0 rounded-xl border border-border bg-muted/40 shadow-lg">
                  {asset.imageUrl ? (
                    <AvatarImage
                      src={asset.imageUrl}
                      alt={asset.name}
                      className="size-full rounded-xl object-cover"
                    />
                  ) : null}
                  <AvatarFallback className="glow-icon-chip flex size-full items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <AssetTypeIcon type={asset.type} name={asset.name} />
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                      {asset.name}
                    </h1>
                    <AssetStatusBadge status={asset.status} />
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">
                    {asset.assetTag}
                    {asset.type ? ` · ${asset.type}` : ""}
                    {asset.brand ? ` · ${asset.brand}` : ""}
                  </p>
                  {asset.currentAssignment ? (
                    <p className="text-xs text-muted-foreground">
                      In custody of{" "}
                      <span className="font-medium text-foreground">
                        {asset.currentAssignment.employeeName}
                      </span>{" "}
                      since {formatDate(asset.currentAssignment.assignedAt)}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {actionNode ? <div className="flex items-center gap-2">{actionNode}</div> : null}
          </div>
        </PageHero>
      </FadeIn>

      {/* ── Asset details + location ─────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Details card */}
        <FadeIn delay={60} className="lg:col-span-2">
          <GlassCard className="p-5 space-y-5">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Asset Information
              </p>
              <InfoGrid
                items={[
                  { label: "Type", value: asset.type },
                  { label: "Brand", value: asset.brand ?? "—" },
                  { label: "Model", value: asset.model ?? "—" },
                  { label: "Serial number", value: asset.serialNumber ?? "—" },
                  {
                    label: "Purchase date",
                    value: asset.purchaseDate ? formatDate(asset.purchaseDate) : "—",
                  },
                  {
                    label: "Purchase price",
                    value: asset.purchasePrice ? `$${asset.purchasePrice}` : "—",
                  },
                  {
                    label: "Warranty expiry",
                    value: asset.warrantyExpiry ? formatDate(asset.warrantyExpiry) : "—",
                  },
                ]}
              />
            </div>

            {isHardwareAsset(asset.type) ? (
              <div className="border-t border-border/50 pt-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Hardware Specifications
                </p>
                {hardwareItems.length > 0 ? (
                  <InfoGrid items={hardwareItems} />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No hardware specifications recorded.
                  </p>
                )}
              </div>
            ) : null}
          </GlassCard>
        </FadeIn>

        {/* Location card */}
        <FadeIn delay={90}>
          {isAdmin ? (
            <AssetLocationForm assetId={asset.id} existingLocation={asset.location} />
          ) : (
            <AssetLocationCard location={asset.location} />
          )}
        </FadeIn>
      </div>

      {/* ── Assignment + Return history ──────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <FadeIn delay={120}>
          <DashboardSection
            title="Assignment History"
            description="Everyone who has custodied this asset."
          >
            {asset.assignmentHistory.length === 0 ? (
              <EmptyState
                icon={History}
                title="No assignment history"
                description="This asset hasn't been assigned yet."
              />
            ) : (
              asset.assignmentHistory.map((a) => (
                <ActivityRow
                  key={a.id}
                  primary={a.employeeName}
                  secondary={a.returnedAt ? "Returned" : "Currently assigned"}
                  meta={formatDate(a.returnedAt ?? a.assignedAt)}
                />
              ))
            )}
          </DashboardSection>
        </FadeIn>

        {isAdmin ? (
          <FadeIn delay={150}>
            <DashboardSection
              title="Return Requests"
              description="Return requests filed for this asset."
            >
              {asset.returnRequests.length === 0 ? (
                <EmptyState
                  icon={Undo2}
                  title="No return requests"
                  description="No one has requested to return this asset."
                />
              ) : (
                asset.returnRequests.map((r) => (
                  <ActivityRow
                    key={r.id}
                    primary={r.employeeName}
                    meta={formatDate(r.requestedAt)}
                    badge={<ReturnRequestStatusBadge status={r.status} />}
                  />
                ))
              )}
            </DashboardSection>
          </FadeIn>
        ) : null}

        <FadeIn delay={180}>
          <DashboardSection
            title="Maintenance History"
            description="Service and repair records."
          >
            {asset.maintenanceRecords.length === 0 ? (
              <EmptyState
                icon={Wrench}
                title="No maintenance records"
                description="This asset hasn't needed repairs yet."
              />
            ) : (
              asset.maintenanceRecords.map((m) => (
                <ActivityRow
                  key={m.id}
                  primary={m.issue}
                  secondary={m.completedAt ? "Completed" : "In progress"}
                  meta={formatDate(m.completedAt ?? m.startedAt)}
                  badge={
                    <Badge variant={m.completedAt ? "success" : "warning"}>
                      {m.completedAt ? "Completed" : "In progress"}
                    </Badge>
                  }
                />
              ))
            )}
          </DashboardSection>
        </FadeIn>
      </div>

      {/* ── Lifecycle Timeline ───────────────────────────────────── */}
      <FadeIn delay={240}>
        <GlassCard className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="glow-icon-chip flex size-8 items-center justify-center rounded-lg text-primary">
              <Clock className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Lifecycle Timeline</p>
              <p className="text-xs text-muted-foreground">
                Complete history of events for this asset.
              </p>
            </div>
          </div>
          <AssetTimeline events={timeline} />
        </GlassCard>
      </FadeIn>
    </div>
  );
}
