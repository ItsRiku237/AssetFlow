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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Asset</TableHead>
          <TableHead>Employee</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Asset Status</TableHead>
          <TableHead>Custody Status</TableHead>
          <TableHead>Assigned</TableHead>
          <TableHead>Returned</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assignments.map((a) => (
          <TableRow key={a.id}>
            <TableCell>
              <Link
                href={`/assets/${a.assetId}`}
                className="font-medium hover:underline"
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
                className="hover:underline"
              >
                {a.employeeName}
              </Link>
              <div className="font-mono text-xs text-muted-foreground">
                {a.employeeCode}
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {a.department}
            </TableCell>
            <TableCell>
              <AssetStatusBadge status={a.assetStatus} />
            </TableCell>
            <TableCell>
              <Badge
                variant={a.status === "ACTIVE" ? "default" : "secondary"}
              >
                {a.status === "ACTIVE" ? "Active" : "Returned"}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(a.assignedAt)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {a.returnedAt ? formatDate(a.returnedAt) : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
