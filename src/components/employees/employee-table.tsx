import Link from "next/link";
import { Eye } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { EmployeeListItem } from "@/lib/data/employees";

export function EmployeeTable({ employees }: { employees: EmployeeListItem[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Employee ID</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead>Assigned Assets</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <TableRow key={employee.id}>
            <TableCell className="font-medium">{employee.name}</TableCell>
            <TableCell className="text-muted-foreground">
              {employee.email}
            </TableCell>
            <TableCell className="font-mono text-xs">
              {employee.employeeCode}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {employee.department}
            </TableCell>
            <TableCell>
              <Badge variant={employee.role === "ADMIN" ? "default" : "secondary"}>
                {employee.role}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(employee.joinedAt)}
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
