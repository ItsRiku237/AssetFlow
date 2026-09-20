import { Shield, ShieldCheck } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeactivateAdminButton, DeleteAdminButton, ReactivateAdminButton } from "@/components/admins/admin-status-button";
import { formatDate } from "@/lib/utils";
import type { AdminListItem } from "@/lib/data/admins";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const PROTECTED_EMAIL = "admin@assetflow.dev";

interface AdminTableProps {
  admins: AdminListItem[];
  currentUserId: string;
}

export function AdminTable({ admins, currentUserId }: AdminTableProps) {
  return (
    <div className="bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Administrator</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Added</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admins.map((admin) => {
            const isSelf = admin.id === currentUserId;
            const isProtected =
              admin.email === PROTECTED_EMAIL || admin.role === "SUPER_ADMIN";

            return (
              <TableRow key={admin.id}>
                {/* Avatar + name/email */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8 border border-border">
                      {admin.image ? (
                        <AvatarImage src={admin.image} alt={admin.name} />
                      ) : null}
                      <AvatarFallback className="text-xs font-semibold">
                        {initials(admin.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {admin.name}
                        {isSelf ? (
                          <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                            (you)
                          </span>
                        ) : null}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {admin.email}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Role badge */}
                <TableCell>
                  {admin.role === "SUPER_ADMIN" ? (
                    <Badge variant="default" className="gap-1 font-medium">
                      <ShieldCheck className="size-3" />
                      Super Admin
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1 font-medium">
                      <Shield className="size-3" />
                      Admin
                    </Badge>
                  )}
                </TableCell>

                {/* Active / Deactivated */}
                <TableCell>
                  <Badge variant={admin.active ? "success" : "secondary"}>
                    {admin.active ? "Active" : "Deactivated"}
                  </Badge>
                </TableCell>

                {/* Date added */}
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(admin.createdAt)}
                </TableCell>

                {/* Actions — only for plain ADMIN accounts, not self, not protected */}
                <TableCell className="text-right">
                  {admin.role === "ADMIN" && !isSelf && !isProtected ? (
                    <div className="flex items-center justify-end gap-1">
                      {admin.active ? (
                        <DeactivateAdminButton adminId={admin.id} />
                      ) : (
                        <ReactivateAdminButton adminId={admin.id} />
                      )}
                      <DeleteAdminButton adminId={admin.id} adminName={admin.name} />
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
