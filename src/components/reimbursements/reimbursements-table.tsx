import Link from "next/link";

import { ApproveReimbursementButton } from "@/components/reimbursements/approve-reimbursement-button";
import { RejectReimbursementDialog } from "@/components/reimbursements/reject-reimbursement-dialog";
import { ReimbursementStatusBadge } from "@/components/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { ReimbursementListItem } from "@/lib/data/reimbursements";

export function ReimbursementsTable({
  requests,
}: {
  requests: ReimbursementListItem[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Asset</TableHead>
          <TableHead>Employee</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Repair</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead>Status</TableHead>
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
            <TableCell className="font-medium">
              {Number(req.amount).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </TableCell>
            <TableCell className="max-w-48 truncate text-sm text-muted-foreground">
              {req.description}
              {req.receiptReference ? (
                <div className="text-xs text-muted-foreground/70">
                  Ref: {req.receiptReference}
                </div>
              ) : null}
            </TableCell>
            <TableCell className="max-w-36 truncate text-xs text-muted-foreground">
              {req.maintenanceIssue ?? "—"}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(req.submittedAt)}
            </TableCell>
            <TableCell>
              <ReimbursementStatusBadge status={req.status} />
              {req.status === "REJECTED" && req.rejectionReason ? (
                <div className="mt-0.5 max-w-36 truncate text-xs text-muted-foreground">
                  {req.rejectionReason}
                </div>
              ) : null}
              {req.status !== "PENDING" && req.reviewedByName ? (
                <div className="text-xs text-muted-foreground/60">
                  {req.reviewedByName}
                  {req.reviewedAt ? `, ${formatDate(req.reviewedAt)}` : ""}
                </div>
              ) : null}
            </TableCell>
            <TableCell className="text-right">
              {req.status === "PENDING" ? (
                <div className="flex items-center justify-end gap-1">
                  <ApproveReimbursementButton reimbursementId={req.id} />
                  <RejectReimbursementDialog reimbursementId={req.id} />
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
