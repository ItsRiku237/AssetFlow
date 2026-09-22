import { Shield, ShieldCheck } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DeactivateAdminButton,
  DeleteAdminButton,
  ReactivateAdminButton,
} from "@/components/admins/admin-status-button";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { isDemoAccountEmail } from "@/lib/demo";
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
  demoMode?: boolean;
}

export function AdminTable({
  admins,
  currentUserId,
  demoMode = false,
}: AdminTableProps) {
  return (
    <>
      {/* ── Desktop table ──────────────────────────────────────── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60">
              {["Administrator", "Role", "Status", "Added", "Actions"].map((h, i) => (
                <th
                  key={h}
                  className={cn(
                    "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                    i === 4 ? "text-right" : "text-left"
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {admins.map((admin, i) => {
              const isSelf = admin.id === currentUserId;
              const isProtected =
                admin.email === PROTECTED_EMAIL ||
                admin.role === "SUPER_ADMIN" ||
                (demoMode && isDemoAccountEmail(admin.email));
              const isSuperAdmin = admin.role === "SUPER_ADMIN";

              return (
                <tr
                  key={admin.id}
                  className={cn(
                    "group border-b border-border/30 transition-colors hover:bg-primary/5",
                    i % 2 === 1 && "bg-muted/20"
                  )}
                >
                  {/* Avatar + name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        className={cn(
                          "size-9 border",
                          isSuperAdmin
                            ? "border-primary/50 ring-1 ring-primary/20"
                            : "border-border"
                        )}
                      >
                        {admin.image ? (
                          <AvatarImage src={admin.image} alt={admin.name} />
                        ) : null}
                        <AvatarFallback
                          className={cn(
                            "text-xs font-semibold",
                            isSuperAdmin && "bg-primary/10 text-primary"
                          )}
                        >
                          {initials(admin.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium leading-snug">
                          {admin.name}
                          {isSelf ? (
                            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                              (you)
                            </span>
                          ) : null}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {admin.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3">
                    {isSuperAdmin ? (
                      <Badge
                        variant="default"
                        className="gap-1.5 border border-primary/30 bg-primary/10 text-primary font-medium"
                      >
                        <ShieldCheck className="size-3" />
                        Super Admin
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="gap-1.5 font-medium"
                      >
                        <Shield className="size-3" />
                        Admin
                      </Badge>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          admin.active ? "bg-success" : "bg-muted-foreground"
                        )}
                      />
                      <Badge variant={admin.active ? "success" : "secondary"}>
                        {admin.active ? "Active" : "Deactivated"}
                      </Badge>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(admin.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {admin.role === "ADMIN" && !isSelf && !isProtected ? (
                        <>
                          {admin.active ? (
                            <DeactivateAdminButton adminId={admin.id} />
                          ) : (
                            <ReactivateAdminButton adminId={admin.id} />
                          )}
                          <DeleteAdminButton
                            adminId={admin.id}
                            adminName={admin.name}
                          />
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Mobile card list ───────────────────────────────────── */}
      <div className="divide-y divide-border/40 md:hidden">
        {admins.map((admin) => {
          const isSelf = admin.id === currentUserId;
          const isProtected =
            admin.email === PROTECTED_EMAIL ||
            admin.role === "SUPER_ADMIN" ||
            (demoMode && isDemoAccountEmail(admin.email));
          const isSuperAdmin = admin.role === "SUPER_ADMIN";

          return (
            <div key={admin.id} className="space-y-3 px-4 py-3">
              {/* Top row: avatar + name + role */}
              <div className="flex items-center gap-3">
                <Avatar
                  className={cn(
                    "size-10 border",
                    isSuperAdmin ? "border-primary/50 ring-1 ring-primary/20" : "border-border"
                  )}
                >
                  {admin.image ? (
                    <AvatarImage src={admin.image} alt={admin.name} />
                  ) : null}
                  <AvatarFallback
                    className={cn(
                      "text-xs font-semibold",
                      isSuperAdmin && "bg-primary/10 text-primary"
                    )}
                  >
                    {initials(admin.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {admin.name}
                    {isSelf ? (
                      <span className="ml-1.5 text-xs font-normal text-muted-foreground">(you)</span>
                    ) : null}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{admin.email}</p>
                </div>
                {isSuperAdmin ? (
                  <Badge variant="default" className="gap-1 border border-primary/30 bg-primary/10 text-primary shrink-0">
                    <ShieldCheck className="size-3" />
                    Super
                  </Badge>
                ) : (
                  <Badge variant={admin.active ? "success" : "secondary"} className="shrink-0">
                    {admin.active ? "Active" : "Off"}
                  </Badge>
                )}
              </div>
              {/* Actions row */}
              {admin.role === "ADMIN" && !isSelf && !isProtected ? (
                <div className="flex items-center gap-2">
                  {admin.active ? (
                    <DeactivateAdminButton adminId={admin.id} />
                  ) : (
                    <ReactivateAdminButton adminId={admin.id} />
                  )}
                  <DeleteAdminButton adminId={admin.id} adminName={admin.name} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );
}
