"use client";

import * as React from "react";
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
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);

  React.useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || e.changedTouches.length === 0) return;
      const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
      touchStartRef.current = null;

      if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        if (deltaX < -40) {
          setOpen(false);
        } else if (deltaX > 40) {
          setOpen(true);
        }
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="size-5" />
          <span className="sr-only">Open navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-72 cursor-pointer flex-col border-y-0 border-l-0 border-sidebar-border/60 bg-sidebar/75 p-0 backdrop-blur-xl backdrop-saturate-150"
      >
        <SheetHeader
          className="h-14 flex-row items-center gap-2 px-4 pt-0 select-none cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex items-center gap-2">
            <span className="glow-icon-chip flex size-8 items-center justify-center rounded-md text-sidebar-primary">
              <Boxes className="size-4" />
            </span>
            <span className="text-sm font-semibold tracking-tight">
              ADP AssetHub
            </span>
          </div>
        </SheetHeader>
        <Separator className="bg-sidebar-border" />
        <div className="flex-1 overflow-y-auto py-3">
          <NavLinks role={role} onNavigate={() => setOpen(false)} />
        </div>
        <Separator className="bg-sidebar-border" />
        <div
          className="flex items-center gap-2.5 px-4 py-4"
          onClick={(e) => e.stopPropagation()}
        >
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
              Smarter Assets.
            </p>
            <p className="text-[11px] text-sidebar-foreground/60">
              Stronger Tomorrow.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
