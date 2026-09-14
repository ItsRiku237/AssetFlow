import type { Session } from "next-auth";
import { Bell, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { UserMenu } from "@/components/layout/user-menu";

export function Topbar({ user }: { user: Session["user"] }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      <MobileSidebar role={user.role} />

      <div className="relative flex-1 max-w-sm">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search assets, employees..."
          className="pl-8"
        />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="size-4" />
        </Button>
        <ModeToggle />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
