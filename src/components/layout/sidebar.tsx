import Link from "next/link";
import { Boxes } from "lucide-react";

import { NavLinks } from "@/components/layout/nav-links";
import { Separator } from "@/components/ui/separator";
import type { Role } from "@/types/role";

export function Sidebar({ role }: { role: Role }) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
      <Link
        href="/dashboard"
        className="flex h-14 items-center gap-2 px-4 text-sidebar-foreground"
      >
        <Boxes className="size-5 text-sidebar-primary" />
        <span className="text-sm font-semibold tracking-tight">
          AssetFlow
        </span>
      </Link>
      <Separator className="bg-sidebar-border" />
      <div className="flex-1 overflow-y-auto py-3">
        <NavLinks role={role} />
      </div>
    </aside>
  );
}
