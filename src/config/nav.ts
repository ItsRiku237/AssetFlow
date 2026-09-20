import {
  LayoutDashboard,
  Boxes,
  Users,
  ClipboardList,
  Undo2,
  Wrench,
  ScrollText,
  Settings,
  UserCircle,
} from "lucide-react";

import type { NavItem } from "@/types/nav";

/**
 * Sidebar structure for every future dashboard module. `roles`
 * records who a link is meant for so it can be filtered once
 * authentication and role checks land; the sidebar itself does not
 * filter yet.
 */
export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["both"] },
  { title: "Assets", href: "/assets", icon: Boxes, roles: ["ADMIN"] },
  { title: "My Assets", href: "/my-assets", icon: Boxes, roles: ["EMPLOYEE"] },
  { title: "Employees", href: "/employees", icon: Users, roles: ["ADMIN"] },
  { title: "Assignments", href: "/assignments", icon: ClipboardList, roles: ["ADMIN"] },
  { title: "Return Requests", href: "/return-requests", icon: Undo2, roles: ["both"] },
  { title: "Repairs", href: "/repairs", icon: Wrench, roles: ["ADMIN"] },
  { title: "Audit Logs", href: "/audit-logs", icon: ScrollText, roles: ["ADMIN"] },
  { title: "Profile", href: "/profile", icon: UserCircle, roles: ["both"] },
  { title: "Settings", href: "/settings", icon: Settings, roles: ["both"] },
];
