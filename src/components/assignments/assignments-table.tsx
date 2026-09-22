import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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
import type { AssignmentListItem } from "@/lib/data/assignments";

export function AssignmentsTable({
  assignments,
}: {
  assignments: AssignmentListItem[];
}) {
  return (
    <>
      {/* ── Desktop table ──────────────────────────────────────── */}
      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/60 hover:bg-transparent">
              <TableHead className="pl-4">Asset</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Asset Status</TableHead>
              <TableHead>Custody</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead className="pr-4">Returned</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((a) => (
              <TableRow
                key={a.id}
                className="group border-b border-border/40 transition-colors hover:bg-primary/5"
              >
                <TableCell className="pl-4">
                  <Link
                    href={`/assets/${a.assetId}`}
                    className="font-medium transition-colors group-hover:text-primary hover:underline"
                  >
                    {a.assetName}
                  </Link>
                  <div className="font-mono text-xs text-muted-foreground">
                    {a.assetTag}
                  </div>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/employees/${a.employeeId}`}
                    className="transition-colors hover:text-primary hover:underline"
                  >
                    {a.employeeName}
                  </Link>
                  <div className="font-mono text-xs text-muted-foreground">
                    {a.employeeCode}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {a.department ?? <span className="opacity-40">—</span>}
                </TableCell>
                <TableCell>
                  <AssetStatusBadge status={a.assetStatus} />
                </TableCell>
                <TableCell>
                  <Badge variant={a.status === "ACTIVE" ? "default" : "secondary"}>
                    {a.status === "ACTIVE" ? "Active" : "Returned"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(a.assignedAt)}
                </TableCell>
                <TableCell className="pr-4 text-sm text-muted-foreground">
                  {a.returnedAt ? formatDate(a.returnedAt) : <span className="opacity-40">—</span>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ── Mobile card list ───────────────────────────────────── */}
      <div className="divide-y divide-border/40 md:hidden">
        {assignments.map((a) => (
          <div key={a.id} className="space-y-2 px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link
                  href={`/assets/${a.assetId}`}
                  className="text-sm font-medium hover:text-primary hover:underline"
                >
                  {a.assetName}
                </Link>
                <p className="font-mono text-xs text-muted-foreground">{a.assetTag}</p>
              </div>
              <Badge variant={a.status === "ACTIVE" ? "default" : "secondary"}>
                {a.status === "ACTIVE" ? "Active" : "Returned"}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-2">
              <Link
                href={`/employees/${a.employeeId}`}
                className="text-sm hover:text-primary hover:underline"
              >
                {a.employeeName}
              </Link>
              <AssetStatusBadge status={a.assetStatus} />
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDate(a.assignedAt)}
              {a.returnedAt ? ` → ${formatDate(a.returnedAt)}` : " — ongoing"}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
