"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ITEMS } from "@/config/nav";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/role";

export function NavLinks({
  role,
  onNavigate,
}: {
  role: Role;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter(
    (item) => item.roles.includes("both") || item.roles.includes(role)
  );

  return (
    <nav className="flex flex-col gap-1 px-2">
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/75 transition-all",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActive && "bg-primary/15 text-sidebar-primary shadow-[0_0_0_1px_var(--glow-cyan)_inset] font-semibold"
            )}
            style={
              isActive
                ? { boxShadow: "0 0 24px -10px var(--glow-cyan)" }
                : undefined
            }
          >
            <Icon
              className={cn(
                "size-4 shrink-0 transition-colors",
                isActive && "text-sidebar-primary"
              )}
            />
            <span className="truncate">{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
