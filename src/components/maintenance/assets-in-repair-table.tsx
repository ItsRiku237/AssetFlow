import Link from "next/link";
import { Wrench } from "lucide-react";

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
    <>
      {/* ── Desktop table ──────────────────────────────────── */}
      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/60 hover:bg-transparent">
              <TableHead className="pl-5">Asset</TableHead>
              <TableHead>Issue</TableHead>
              <TableHead>Repair started</TableHead>
              <TableHead className="pr-5 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
              <TableRow
                key={asset.id}
                className="group border-b border-border/40 transition-colors hover:bg-primary/5"
              >
                <TableCell className="pl-5">
                  <div className="flex items-center gap-3">
                    <span className="glow-icon-chip flex size-8 shrink-0 items-center justify-center rounded-lg text-warning">
                      <Wrench className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <Link
                        href={`/assets/${asset.id}`}
                        className="font-medium transition-colors hover:text-primary hover:underline"
                      >
                        {asset.name}
                      </Link>
                      <div className="font-mono text-xs text-muted-foreground">
                        {asset.assetTag}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="max-w-56">
                  <p className="truncate text-sm text-muted-foreground">
                    {asset.activeIssue ?? (
                      <span className="italic opacity-60">No record logged yet</span>
                    )}
                  </p>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {asset.repairStartedAt ? formatDate(asset.repairStartedAt) : "—"}
                </TableCell>
                <TableCell className="pr-5 text-right">
                  {asset.activeMaintenanceRecordId ? (
                    <div className="flex justify-end gap-1.5">
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
      </div>

      {/* ── Mobile cards ───────────────────────────────────── */}
      <div className="divide-y divide-border/40 md:hidden">
        {assets.map((asset) => (
          <div key={asset.id} className="space-y-3 px-4 py-4">
            <div className="flex items-start gap-3">
              <span className="glow-icon-chip flex size-8 shrink-0 items-center justify-center rounded-lg text-warning">
                <Wrench className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/assets/${asset.id}`}
                  className="font-medium hover:text-primary hover:underline"
                >
                  {asset.name}
                </Link>
                <p className="font-mono text-xs text-muted-foreground">{asset.assetTag}</p>
                {asset.activeIssue ? (
                  <p className="mt-1 text-xs text-muted-foreground">{asset.activeIssue}</p>
                ) : (
                  <p className="mt-1 text-xs italic text-muted-foreground/60">
                    No record logged yet
                  </p>
                )}
                {asset.repairStartedAt ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Started {formatDate(asset.repairStartedAt)}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {asset.activeMaintenanceRecordId ? (
                <>
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
                </>
              ) : (
                <StartMaintenanceDialog assetId={asset.id} />
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
