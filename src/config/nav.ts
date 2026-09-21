import {
  LayoutDashboard,
  Boxes,
  Users,
  ClipboardList,
  Undo2,
  Wrench,
  ScrollText,
  UserCircle,
  ShieldCheck,
  PackageSearch,
  PackagePlus,
} from "lucide-react";

import type { NavItem } from "@/types/nav";

export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard",        href: "/dashboard",        icon: LayoutDashboard, roles: ["both"] },
  { title: "Assets",           href: "/assets",           icon: Boxes,           roles: ["ADMIN", "SUPER_ADMIN"] },
  { title: "My Assets",        href: "/my-assets",        icon: Boxes,           roles: ["EMPLOYEE"] },
  { title: "Browse Assets",    href: "/available-assets", icon: PackageSearch,   roles: ["EMPLOYEE"] },
  { title: "Employees",        href: "/employees",        icon: Users,           roles: ["ADMIN", "SUPER_ADMIN"] },
  { title: "Assignments",      href: "/assignments",      icon: ClipboardList,   roles: ["ADMIN", "SUPER_ADMIN"] },
  { title: "Asset Requests",   href: "/asset-requests",   icon: PackagePlus,     roles: ["ADMIN", "SUPER_ADMIN"] },
  { title: "Return Requests",  href: "/return-requests",  icon: Undo2,           roles: ["both"] },
  { title: "Repairs",          href: "/repairs",          icon: Wrench,          roles: ["ADMIN", "SUPER_ADMIN"] },
  { title: "Audit Logs",       href: "/audit-logs",       icon: ScrollText,      roles: ["ADMIN", "SUPER_ADMIN"] },
  { title: "Admins",           href: "/admins",           icon: ShieldCheck,     roles: ["SUPER_ADMIN"] },
  { title: "Profile",          href: "/profile",          icon: UserCircle,      roles: ["both"] },
];
