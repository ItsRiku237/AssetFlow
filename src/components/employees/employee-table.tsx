import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AccountLinkBadge,
  EmployeeStatusBadge,
} from "@/components/shared/status-badge";
import type { EmployeeListItem } from "@/lib/data/employees";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function EmployeeTable({
  employees,
}: {
  employees: EmployeeListItem[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Department / Position</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Account</TableHead>
          <TableHead className="tabular-nums">Assets</TableHead>
          <TableHead className="text-right">View</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <TableRow
            key={employee.id}
            className="group transition-colors hover:bg-accent/40"
          >
            {/* Avatar + name + ID */}
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="size-8 border border-border">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {initials(employee.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-medium">{employee.name}</p>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {employee.employeeCode}
                  </p>
                </div>
              </div>
            </TableCell>

            {/* Department / position */}
            <TableCell>
              <p className="text-sm">{employee.department ?? "—"}</p>
              {employee.designation ? (
                <p className="text-xs text-muted-foreground">
                  {employee.designation}
                </p>
              ) : null}
            </TableCell>

            <TableCell>
              <EmployeeStatusBadge status={employee.status} />
            </TableCell>

            <TableCell>
              <AccountLinkBadge linked={employee.accountLinked} />
            </TableCell>

            <TableCell className="tabular-nums text-sm">
              {employee.assignedAssetCount}
            </TableCell>

            <TableCell>
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="gap-1 opacity-70 group-hover:opacity-100"
                >
                  <Link
                    href={`/employees/${employee.id}`}
                    aria-label={`View ${employee.name}`}
                  >
                    View
                    <ArrowRight className="size-3" />
                  </Link>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
