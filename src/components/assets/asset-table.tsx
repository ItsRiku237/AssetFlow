"use client";

import React from "react";
import Link from "next/link";
import {
  Boxes,
  Cpu,
  Eye,
  HardDrive,
  Headphones,
  Keyboard,
  Laptop,
  Mic,
  Monitor,
  Mouse,
  Network,
  Package,
  Pencil,
  Phone,
  Printer,
  Router,
  Server,
  Tablet,
  Tv,
  Video,
  Volume2,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AssetStatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import { formatLocationSummary } from "@/components/assets/asset-location-card";
import type { AssetListItem } from "@/lib/data/assets";

// ── Asset type icon mapping ───────────────────────────────────────────────────

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

// ── Asset thumbnail component with robust fallback ─────────────────────────────

function AssetThumbnail({
  imageUrl,
  name,
  type,
}: {
  imageUrl: string | null | undefined;
  name: string;
  type: string;
}) {
  const [imgError, setImgError] = useState(false);
  const hasValidUrl = Boolean(imageUrl && imageUrl.trim().length > 0 && !imgError);

  return (
    <div className="relative size-8 shrink-0 overflow-hidden rounded-md border border-border/50 bg-muted/30">
      {hasValidUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl!}
          alt={name}
          className="size-full object-cover"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="flex size-full items-center justify-center bg-primary/10 text-primary">
          {React.createElement(getAssetIcon(type, name), { className: "size-4 shrink-0" })}
        </div>
      )}
    </div>
  );
}

export function AssetTable({ assets }: { assets: AssetListItem[] }) {
  return (
    <>
      {/* ── Desktop table ──────────────────────────────────────── */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/60 hover:bg-transparent">
              <TableHead className="w-10 pl-4" />
              <TableHead>Asset</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned to</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Purchased</TableHead>
              <TableHead className="pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
              <TableRow
                key={asset.id}
                className="group border-b border-border/40 transition-colors hover:bg-primary/5"
              >
                <TableCell className="pl-4">
                  <AssetThumbnail imageUrl={asset.imageUrl ?? null} name={asset.name} type={asset.type} />
                </TableCell>
                <TableCell>
                  <div className="font-medium leading-snug group-hover:text-primary transition-colors">
                    {asset.name}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="font-mono">{asset.assetTag}</span>
                    <span className="opacity-40">·</span>
                    <span>{asset.type}</span>
                    {asset.model ? (
                      <>
                        <span className="opacity-40">·</span>
                        <span className="truncate max-w-32">{asset.model}</span>
                      </>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <AssetStatusBadge status={asset.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {asset.assignedEmployeeName ?? (
                    <span className="opacity-40">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatLocationSummary(asset.location) ?? (
                    <span className="opacity-40">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {asset.purchaseDate ? formatDate(asset.purchaseDate) : (
                    <span className="opacity-40">—</span>
                  )}
                </TableCell>
                <TableCell className="pr-4">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Link href={`/assets/${asset.id}`} aria-label="View asset">
                        <Eye className="size-3.5" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Link href={`/assets/${asset.id}/edit`} aria-label="Edit asset">
                        <Pencil className="size-3.5" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ── Mobile card list ───────────────────────────────────── */}
      <div className="divide-y divide-border/40 md:hidden">
        {assets.map((asset) => (
          <Link
            key={asset.id}
            href={`/assets/${asset.id}`}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-primary/5"
          >
            <AssetThumbnail imageUrl={asset.imageUrl ?? null} name={asset.name} type={asset.type} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{asset.name}</p>
              <p className="text-xs text-muted-foreground font-mono">{asset.assetTag}</p>
              {asset.assignedEmployeeName ? (
                <p className="text-xs text-muted-foreground">{asset.assignedEmployeeName}</p>
              ) : null}
            </div>
            <AssetStatusBadge status={asset.status} />
          </Link>
        ))}
      </div>
    </>
  );
}
