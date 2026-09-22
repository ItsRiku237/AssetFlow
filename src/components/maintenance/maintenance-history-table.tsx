import Link from "next/link";
import { History } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MaintenanceStatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import type { MaintenanceHistoryItem } from "@/lib/data/maintenance";

export function MaintenanceHistoryTable({
  records,
}: {
  records: MaintenanceHistoryItem[];
}) {
  return (
    <>
      {/* ── Desktop table ──────────────────────────────────── */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/60 hover:bg-transparent">
              <TableHead className="pl-5 min-w-[180px]">Asset</TableHead>
              <TableHead className="min-w-[200px]">Issue</TableHead>
              <TableHead className="min-w-[130px]">Vendor</TableHead>
              <TableHead className="min-w-[110px]">Cost</TableHead>
              <TableHead className="min-w-[120px]">Started</TableHead>
              <TableHead className="min-w-[120px]">Completed</TableHead>
              <TableHead className="pr-5 min-w-[130px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow
                key={record.id}
                className="group border-b border-border/40 transition-colors hover:bg-primary/5"
              >
                <TableCell className="pl-5 min-w-[180px]">
                  <Link
                    href={`/assets/${record.assetId}`}
                    className="font-medium transition-colors hover:text-primary hover:underline"
                  >
                    {record.assetName}
                  </Link>
                  <div className="font-mono text-xs text-muted-foreground">
                    {record.assetTag}
                  </div>
                </TableCell>
                <TableCell className="min-w-[200px] max-w-xs">
                  <p className="truncate text-sm text-muted-foreground">
                    {record.issue}
                  </p>
                  {record.resolution ? (
                    <p className="truncate text-xs text-muted-foreground/70">
                      ↳ {record.resolution}
                    </p>
                  ) : null}
                </TableCell>
                <TableCell className="min-w-[130px] text-sm text-muted-foreground">
                  {record.vendor ?? "—"}
                </TableCell>
                <TableCell className="min-w-[110px] text-sm font-medium">
                  {record.cost ? (
                    `$${record.cost}`
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="min-w-[120px] text-sm text-muted-foreground">
                  {formatDate(record.startedAt)}
                </TableCell>
                <TableCell className="min-w-[120px] text-sm text-muted-foreground">
                  {record.completedAt ? formatDate(record.completedAt) : "—"}
                </TableCell>
                <TableCell className="pr-5 min-w-[130px]">
                  <MaintenanceStatusBadge status={record.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ── Mobile cards ───────────────────────────────────── */}
      <div className="divide-y divide-border/40 md:hidden">
        {records.map((record) => (
          <div key={record.id} className="flex items-start gap-3 px-4 py-4">
            <span className="glow-icon-chip flex size-8 shrink-0 items-center justify-center rounded-lg text-primary">
              <History className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    href={`/assets/${record.assetId}`}
                    className="font-medium hover:text-primary hover:underline"
                  >
                    {record.assetName}
                  </Link>
                  <p className="font-mono text-xs text-muted-foreground">{record.assetTag}</p>
                </div>
                <MaintenanceStatusBadge status={record.status} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{record.issue}</p>
              {record.resolution ? (
                <p className="mt-0.5 text-xs text-muted-foreground/70">↳ {record.resolution}</p>
              ) : null}
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                {record.vendor ? <span>Vendor: {record.vendor}</span> : null}
                {record.cost ? <span>Cost: ${record.cost}</span> : null}
                <span>Started: {formatDate(record.startedAt)}</span>
                {record.completedAt ? (
                  <span>Completed: {formatDate(record.completedAt)}</span>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
