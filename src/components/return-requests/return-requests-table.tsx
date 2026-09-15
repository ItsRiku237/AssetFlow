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
          <TableRow key={req.id}>
            <TableCell>
              <Link
                href={`/assets/${req.assetId}`}
                className="font-medium hover:underline"
              >
                {req.assetName}
              </Link>
              <div className="font-mono text-xs text-muted-foreground">
                {req.assetTag}
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {req.employeeName}
            </TableCell>
            <TableCell className="max-w-48 truncate text-sm text-muted-foreground">
              {req.reason}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(req.requestedAt)}
            </TableCell>
            <TableCell>
              <ReturnRequestStatusBadge status={req.status} />
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {req.reviewedAt
                ? `${formatDate(req.reviewedAt)} by ${req.reviewedByName ?? "Admin"}`
                : "—"}
            </TableCell>
            <TableCell>
              {req.status === "PENDING" ? (
                <div className="flex justify-end gap-1">
                  <ApproveReturnButton requestId={req.id} />
                  <RejectReturnButton requestId={req.id} />
                </div>
              ) : (
                <div className="text-right text-xs text-muted-foreground">
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
