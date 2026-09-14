"use client";

import * as React from "react";
import Link from "next/link";
import { Boxes, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NavLinks } from "@/components/layout/nav-links";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Role } from "@/types/role";

export function MobileSidebar({ role }: { role: Role }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="size-5" />
          <span className="sr-only">Open navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="h-14 flex-row items-center gap-2 pt-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2"
          >
            <Boxes className="size-5 text-sidebar-primary" />
            <span className="text-sm font-semibold tracking-tight">
              AssetFlow
            </span>
          </Link>
        </SheetHeader>
        <Separator className="bg-sidebar-border" />
        <div className="flex-1 overflow-y-auto py-3">
          <NavLinks role={role} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
