"use client";

import { useState } from "react";
import { Boxes, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { NavLinks } from "@/components/layout/nav-links";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Role } from "@/types/role";

export function Sidebar({ role }: { role: Role }) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed((value) => !value);
  };

  return (
    <aside
      onClick={toggleSidebar}
      className={`glass-panel relative z-10 hidden shrink-0 cursor-pointer flex-col border-y-0 border-l-0 text-sidebar-foreground transition-[width] duration-200 ease-out md:flex ${
        collapsed ? "w-[4.5rem]" : "w-64"
      }`}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          toggleSidebar();
        }}
        className={`flex h-14 cursor-pointer select-none items-center text-sidebar-foreground ${
          collapsed ? "justify-center px-2" : "gap-2 px-4"
        }`}
        role="button"
        tabIndex={0}
        aria-label="ADP AssetHub toggle sidebar"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleSidebar();
          }
        }}
      >
        <span className="glow-icon-chip flex size-8 items-center justify-center rounded-md text-sidebar-primary">
          <Boxes className="size-4" />
        </span>
        {collapsed ? null : (
          <span className="text-sm font-semibold tracking-tight">ADP AssetHub</span>
        )}
      </div>
      <Separator className="bg-sidebar-border" />
      <div className="flex-1 overflow-y-auto py-3">
        <NavLinks role={role} collapsed={collapsed} />
      </div>
      <Separator className="bg-sidebar-border" />
      <div
        onClick={(e) => e.stopPropagation()}
        className={`flex items-center py-3 ${collapsed ? "justify-center px-2" : "justify-between gap-2.5 px-4"}`}
      >
        {collapsed ? null : (
          <div className="min-w-0">
            <p className="text-xs font-semibold leading-tight">Smarter Assets.</p>
            <p className="text-[11px] text-sidebar-foreground/60">Stronger Tomorrow.</p>
          </div>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={(e) => {
            e.stopPropagation();
            toggleSidebar();
          }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </Button>
      </div>
    </aside>
  );
}
