import Link from "next/link";

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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Asset</TableHead>
          <TableHead>Issue</TableHead>
          <TableHead>Vendor</TableHead>
          <TableHead>Cost</TableHead>
          <TableHead>Started</TableHead>
          <TableHead>Completed</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record) => (
          <TableRow key={record.id}>
            <TableCell>
              <Link
                href={`/assets/${record.assetId}`}
                className="font-medium hover:underline"
              >
                {record.assetName}
              </Link>
              <div className="font-mono text-xs text-muted-foreground">
                {record.assetTag}
              </div>
            </TableCell>
            <TableCell className="max-w-48 truncate text-sm text-muted-foreground">
              {record.issue}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {record.vendor ?? "—"}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {record.cost ? `$${record.cost}` : "—"}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(record.startedAt)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {record.completedAt ? formatDate(record.completedAt) : "—"}
            </TableCell>
            <TableCell>
              <MaintenanceStatusBadge status={record.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
