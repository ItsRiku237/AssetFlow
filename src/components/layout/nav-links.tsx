"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ITEMS } from "@/config/nav";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/role";

export function NavLinks({
  role,
  onNavigate,
  collapsed = false,
}: {
  role: Role;
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter(
    (item) => item.roles.includes("both") || item.roles.includes(role)
  );

  return (
    <TooltipProvider delayDuration={150}>
      <nav className="flex flex-col gap-1 px-2">
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        const link = (
          <Link
            href={item.href}
            onClick={(e) => {
              e.stopPropagation();
              onNavigate?.();
            }}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group relative flex items-center rounded-lg text-sm font-medium text-sidebar-foreground/75 transition-all",
              collapsed ? "justify-center px-2 py-2.5" : "gap-2.5 px-3 py-2",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActive && "border border-primary/25 bg-primary/12 text-sidebar-primary shadow-[0_10px_22px_-18px_var(--glow-cyan)] font-semibold"
            )}
          >
            <Icon
              className={cn(
                "size-4 shrink-0 transition-colors",
                isActive && "text-sidebar-primary"
              )}
            />
            {collapsed ? (
              <span className="sr-only">{item.title}</span>
            ) : (
              <span className="truncate">{item.title}</span>
            )}
          </Link>
        );

        return collapsed ? (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right">{item.title}</TooltipContent>
          </Tooltip>
        ) : (
          <span key={item.href}>{link}</span>
        );
      })}
      </nav>
    </TooltipProvider>
  );
}
