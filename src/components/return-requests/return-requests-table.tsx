import Link from "next/link";

import { ApproveReturnButton } from "@/components/return-requests/approve-return-button";
import { RejectReturnButton } from "@/components/return-requests/reject-return-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReturnRequestStatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import type { ReturnRequestListItem } from "@/lib/data/return-requests";

export function ReturnRequestsTable({
  requests,
}: {
  requests: ReturnRequestListItem[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Asset</TableHead>
          <TableHead>Employee</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Requested</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Reviewed</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((req) => (
          <TableRow
            key={req.id}
            className="group transition-colors hover:bg-accent/40"
          >
            <TableCell>
              <Link
                href={`/assets/${req.assetId}`}
                className="font-medium hover:text-primary hover:underline"
              >
                {req.assetName}
              </Link>
              <div className="font-mono text-xs text-muted-foreground">
                {req.assetTag}
              </div>
            </TableCell>

            <TableCell>
              <p className="text-sm font-medium">{req.employeeName}</p>
            </TableCell>

            <TableCell className="max-w-48">
              <p className="truncate text-sm text-muted-foreground">
                {req.reason}
              </p>
            </TableCell>

            <TableCell className="text-sm text-muted-foreground">
              {formatDate(req.requestedAt)}
            </TableCell>

            <TableCell>
              <ReturnRequestStatusBadge status={req.status} />
            </TableCell>

            <TableCell className="text-xs text-muted-foreground">
              {req.reviewedAt
                ? `${formatDate(req.reviewedAt)} · ${req.reviewedByName ?? "Admin"}`
                : <span className="opacity-50">—</span>}
            </TableCell>

            <TableCell>
              {req.status === "PENDING" ? (
                <div className="flex justify-end gap-1.5">
                  <ApproveReturnButton requestId={req.id} />
                  <RejectReturnButton requestId={req.id} />
                </div>
              ) : (
                <div className="text-right text-xs text-muted-foreground/60">
                  Processed
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
