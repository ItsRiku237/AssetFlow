import Link from "next/link";
import { Eye, Pencil } from "lucide-react";

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

export function AssetTable({ assets }: { assets: AssetListItem[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tag</TableHead>
          <TableHead>Name / Type</TableHead>
          <TableHead>Model</TableHead>
          <TableHead>Serial</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Assigned to</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Purchased</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assets.map((asset) => (
          <TableRow key={asset.id}>
            <TableCell className="font-mono text-xs">{asset.assetTag}</TableCell>
            <TableCell>
              <div className="font-medium">{asset.name}</div>
              <div className="text-xs text-muted-foreground">{asset.type}</div>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {asset.model ?? "—"}
            </TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">
              {asset.serialNumber ?? "—"}
            </TableCell>
            <TableCell>
              <AssetStatusBadge status={asset.status} />
            </TableCell>
            <TableCell className="text-muted-foreground">
              {asset.assignedEmployeeName ?? "—"}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatLocationSummary(asset.location) ?? "—"}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {asset.purchaseDate ? formatDate(asset.purchaseDate) : "—"}
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/assets/${asset.id}`} aria-label="View asset">
                    <Eye className="size-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/assets/${asset.id}/edit`} aria-label="Edit asset">
                    <Pencil className="size-4" />
                  </Link>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
