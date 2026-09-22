import Link from "next/link";
import { Boxes } from "lucide-react";

import { NavLinks } from "@/components/layout/nav-links";
import { Separator } from "@/components/ui/separator";
import type { Role } from "@/types/role";

export function Sidebar({ role }: { role: Role }) {
  return (
    <aside className="glass-panel relative z-10 hidden w-64 shrink-0 flex-col border-y-0 border-l-0 text-sidebar-foreground md:flex">
      <Link
        href="/dashboard"
        className="flex h-14 items-center gap-2 px-4 text-sidebar-foreground"
      >
        <span className="glow-icon-chip flex size-8 items-center justify-center rounded-md text-sidebar-primary">
          <Boxes className="size-4" />
        </span>
        <span className="text-sm font-semibold tracking-tight">
          AssetFlow
        </span>
      </Link>
      <Separator className="bg-sidebar-border" />
      <div className="flex-1 overflow-y-auto py-3">
        <NavLinks role={role} />
      </div>
      <Separator className="bg-sidebar-border" />
      <div className="flex items-center gap-2.5 px-4 py-4">
        <span
          aria-hidden
          className="h-9 w-1 shrink-0 rounded-full"
          style={{
            background:
              "linear-gradient(180deg, var(--glow-cyan), var(--glow-purple))",
          }}
        />
        <div className="min-w-0">
          <p className="text-xs font-semibold leading-tight">
            Smarter Asset Management
          </p>
          <p className="text-[11px] text-sidebar-foreground/60">
            Track · Assign · Optimize
          </p>
        </div>
      </div>
    </aside>
  );
}
