"use client";

import type { Session } from "next-auth";
import Link from "next/link";
import { LogOut, Settings, UserCircle } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/actions/auth-actions";

function initials(name: string | null | undefined) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Administrator",
  EMPLOYEE: "Employee",
};

const itemCls =
  "gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors focus:bg-primary/10 focus:text-primary [&_svg]:size-4 [&_svg]:shrink-0";

export function UserMenu({ user }: { user: Session["user"] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-11 gap-2 px-2"
          aria-label="Open account menu"
        >
          <span className="glow-ring inline-flex rounded-full">
            <Avatar className="size-8">
              {user.image ? <AvatarImage src={user.image} alt="" /> : null}
              <AvatarFallback className="bg-primary/15 font-semibold text-primary">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
          </span>
          <span className="hidden flex-col items-start leading-tight sm:flex">
            <span className="text-sm font-medium">
              {user.name ?? user.email}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {ROLE_LABEL[user.role] ?? user.role}
            </span>
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-60 border-[var(--glass-border)] bg-[var(--glass-bg)] p-1.5 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.4),inset_0_1px_0_var(--glass-highlight)] backdrop-blur-2xl"
      >
        {/* Account identity */}
        <DropdownMenuLabel className="px-2.5 py-2.5">
          <div className="flex items-center gap-2.5">
            <Avatar className="size-8 shrink-0">
              {user.image ? <AvatarImage src={user.image} alt="" /> : null}
              <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {user.name ?? "Account"}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {user.email}
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-primary/80">
                {ROLE_LABEL[user.role] ?? user.role}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="mx-1 my-1 bg-border/50" />

        <DropdownMenuItem asChild className={itemCls}>
          <Link href="/profile">
            <UserCircle />
            Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className={itemCls}>
          <Link href="/settings">
            <Settings />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="mx-1 my-1 bg-border/50" />

        <form action={logout} className="w-full">
          <DropdownMenuItem
            asChild
            variant="destructive"
            className={`${itemCls} data-[variant=destructive]:focus:bg-destructive/10`}
          >
            <button type="submit" className="w-full">
              <LogOut />
              Sign out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
