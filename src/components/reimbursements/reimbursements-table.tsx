import Link from "next/link";
import { Receipt } from "lucide-react";

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

function formatAmount(amount: string): string {
  return Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function ReimbursementsTable({
  requests,
}: {
  requests: ReimbursementListItem[];
}) {
  return (
    <>
      {/* ── Desktop table ──────────────────────────────────── */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/60 hover:bg-transparent">
              <TableHead className="pl-5 min-w-[180px]">Asset</TableHead>
              <TableHead className="min-w-[150px]">Employee</TableHead>
              <TableHead className="min-w-[110px]">Amount</TableHead>
              <TableHead className="min-w-[200px]">Description</TableHead>
              <TableHead className="min-w-[140px]">Repair</TableHead>
              <TableHead className="min-w-[120px]">Submitted</TableHead>
              <TableHead className="min-w-[140px]">Status</TableHead>
              <TableHead className="pr-5 min-w-[150px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => (
              <TableRow
                key={req.id}
                className="group border-b border-border/40 transition-colors hover:bg-primary/5"
              >
                <TableCell className="pl-5 min-w-[180px]">
                  <Link
                    href={`/assets/${req.assetId}`}
                    className="font-medium transition-colors hover:text-primary hover:underline"
                  >
                    {req.assetName}
                  </Link>
                  <div className="font-mono text-xs text-muted-foreground">
                    {req.assetTag}
                  </div>
                </TableCell>
                <TableCell className="min-w-[150px] text-sm text-muted-foreground">
                  {req.employeeName}
                </TableCell>
                <TableCell className="min-w-[110px] font-semibold tabular-nums">
                  ${formatAmount(req.amount)}
                </TableCell>
                <TableCell className="min-w-[200px] max-w-xs">
                  <p className="truncate text-sm text-muted-foreground">{req.description}</p>
                  {req.receiptReference ? (
                    <div className="text-xs text-muted-foreground/70">
                      Ref: {req.receiptReference}
                    </div>
                  ) : null}
                </TableCell>
                <TableCell className="min-w-[140px] max-w-xs">
                  <p className="truncate text-xs text-muted-foreground">
                    {req.maintenanceIssue ?? "—"}
                  </p>
                </TableCell>
                <TableCell className="min-w-[120px] text-sm text-muted-foreground">
                  {formatDate(req.submittedAt)}
                </TableCell>
                <TableCell className="min-w-[140px]">
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
                <TableCell className="pr-5 min-w-[150px] text-right">
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
      </div>

      {/* ── Mobile cards ───────────────────────────────────── */}
      <div className="divide-y divide-border/40 md:hidden">
        {requests.map((req) => (
          <div key={req.id} className="space-y-3 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className="glow-icon-chip flex size-8 shrink-0 items-center justify-center rounded-lg text-primary">
                  <Receipt className="size-4" />
                </span>
                <div className="min-w-0">
                  <Link
                    href={`/assets/${req.assetId}`}
                    className="font-medium hover:text-primary hover:underline"
                  >
                    {req.assetName}
                  </Link>
                  <p className="font-mono text-xs text-muted-foreground">{req.assetTag}</p>
                  <p className="text-xs text-muted-foreground">{req.employeeName}</p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <ReimbursementStatusBadge status={req.status} />
                <span className="text-sm font-semibold tabular-nums">
                  {formatAmount(req.amount)}
                </span>
              </div>
            </div>
            <div className="space-y-0.5 text-xs text-muted-foreground">
              <p className="truncate">{req.description}</p>
              {req.maintenanceIssue ? <p>Repair: {req.maintenanceIssue}</p> : null}
              {req.receiptReference ? <p>Ref: {req.receiptReference}</p> : null}
              {req.rejectionReason ? (
                <p className="text-destructive/80">Rejected: {req.rejectionReason}</p>
              ) : null}
              {req.reviewedByName && req.status !== "PENDING" ? (
                <p>
                  Reviewed by {req.reviewedByName}
                  {req.reviewedAt ? ` · ${formatDate(req.reviewedAt)}` : ""}
                </p>
              ) : null}
              <p>Submitted {formatDate(req.submittedAt)}</p>
            </div>
            {req.status === "PENDING" ? (
              <div className="flex flex-wrap gap-2">
                <ApproveReimbursementButton reimbursementId={req.id} />
                <RejectReimbursementDialog reimbursementId={req.id} />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </>
  );
}
