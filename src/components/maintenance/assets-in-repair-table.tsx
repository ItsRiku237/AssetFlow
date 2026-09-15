import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StartMaintenanceDialog } from "@/components/maintenance/start-maintenance-dialog";
import { EditMaintenanceDialog } from "@/components/maintenance/edit-maintenance-dialog";
import { CompleteMaintenanceButton } from "@/components/maintenance/complete-maintenance-button";
import { formatDate } from "@/lib/utils";
import type { AssetInRepairItem } from "@/lib/data/maintenance";

export function AssetsInRepairTable({
  assets,
}: {
  assets: AssetInRepairItem[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Asset</TableHead>
          <TableHead>Issue</TableHead>
          <TableHead>Repair started</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assets.map((asset) => (
          <TableRow key={asset.id}>
            <TableCell>
              <Link
                href={`/assets/${asset.id}`}
                className="font-medium hover:underline"
              >
                {asset.name}
              </Link>
              <div className="font-mono text-xs text-muted-foreground">
                {asset.assetTag}
              </div>
            </TableCell>
            <TableCell className="max-w-56 truncate text-sm text-muted-foreground">
              {asset.activeIssue ?? (
                <span className="italic">No record logged yet</span>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {asset.repairStartedAt ? formatDate(asset.repairStartedAt) : "—"}
            </TableCell>
            <TableCell className="text-right">
              {asset.activeMaintenanceRecordId ? (
                <div className="flex justify-end gap-1">
                  <EditMaintenanceDialog
                    recordId={asset.activeMaintenanceRecordId}
                    issue={asset.activeIssue ?? ""}
                    description={asset.activeDescription}
                    vendor={asset.activeVendor}
                    cost={asset.activeCost}
                  />
                  <CompleteMaintenanceButton
                    recordId={asset.activeMaintenanceRecordId}
                  />
                </div>
              ) : (
                <StartMaintenanceDialog assetId={asset.id} />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
