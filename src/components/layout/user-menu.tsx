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
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium">{user.name ?? "Account"}</p>
          <p className="truncate text-xs text-muted-foreground">
            {user.email}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserCircle />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={logout} className="w-full">
          <DropdownMenuItem asChild variant="destructive">
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
