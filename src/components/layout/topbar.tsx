import type { Session } from "next-auth";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { NotificationBell } from "@/components/layout/notification-bell";
import { UserMenu } from "@/components/layout/user-menu";
import {
  getUserNotifications,
  getUnreadNotificationCount,
} from "@/lib/data/notifications";

export async function Topbar({ user }: { user: Session["user"] }) {
  const [notifications, unreadCount] = await Promise.all([
    getUserNotifications(user.id),
    getUnreadNotificationCount(user.id),
  ]);

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
        <NotificationBell
          notifications={notifications}
          unreadCount={unreadCount}
        />
        <ModeToggle />
        <UserMenu user={user} />
      </div>
    </header>
  );
}