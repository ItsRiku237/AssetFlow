import Link from "next/link";

import { ApproveAssetRequestButton } from "@/components/asset-requests/approve-asset-request-button";
import { RejectAssetRequestButton } from "@/components/asset-requests/reject-asset-request-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AssetRequestStatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import type { AssetRequestListItem } from "@/lib/data/asset-requests";

export function AssetRequestsTable({
  requests,
}: {
  requests: AssetRequestListItem[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Asset</TableHead>
          <TableHead>Requested by</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Review note</TableHead>
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

            <TableCell className="max-w-40">
              <p className="truncate text-sm text-muted-foreground">
                {req.reason ?? <span className="italic opacity-50">—</span>}
              </p>
            </TableCell>

            <TableCell className="text-sm text-muted-foreground">
              {formatDate(req.requestedAt)}
            </TableCell>

            <TableCell>
              <AssetRequestStatusBadge status={req.status} />
            </TableCell>

            <TableCell className="max-w-40">
              {req.reviewNote ? (
                <p className="truncate text-xs text-muted-foreground">
                  {req.reviewNote}
                  {req.reviewedAt
                    ? ` · ${formatDate(req.reviewedAt)}`
                    : ""}
                </p>
              ) : (
                <span className="text-xs text-muted-foreground/50">—</span>
              )}
            </TableCell>

            <TableCell>
              {req.status === "PENDING" ? (
                <div className="flex justify-end gap-1.5">
                  <ApproveAssetRequestButton requestId={req.id} />
                  <RejectAssetRequestButton requestId={req.id} />
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
