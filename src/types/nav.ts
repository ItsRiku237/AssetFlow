import type { LucideIcon } from "lucide-react";

/**
 * A role a nav item is visible to. "both" items show for every
 * authenticated user regardless of role.
 */
export type NavRole = "SUPER_ADMIN" | "ADMIN" | "EMPLOYEE" | "both";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: NavRole[];
}
