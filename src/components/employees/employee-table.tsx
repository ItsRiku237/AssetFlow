import Link from "next/link";
import { Eye } from "lucide-react";

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

export function EmployeeTable({ employees }: { employees: EmployeeListItem[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Account</TableHead>
          <TableHead>Assigned Assets</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <TableRow key={employee.id}>
            <TableCell className="font-mono text-xs">
              {employee.employeeCode}
            </TableCell>
            <TableCell className="font-medium">{employee.name}</TableCell>
            <TableCell className="text-muted-foreground">
              {employee.email ?? "—"}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {employee.department ?? "—"}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {employee.designation ?? "—"}
            </TableCell>
            <TableCell>
              <EmployeeStatusBadge status={employee.status} />
            </TableCell>
            <TableCell>
              <AccountLinkBadge linked={employee.accountLinked} />
            </TableCell>
            <TableCell className="tabular-nums">
              {employee.assignedAssetCount}
            </TableCell>
            <TableCell>
              <div className="flex justify-end">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/employees/${employee.id}`} aria-label="View employee">
                    <Eye className="size-4" />
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
