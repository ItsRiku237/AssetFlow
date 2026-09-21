import "server-only";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import type { Role } from "@/types/role";

/**
 * Resolves the current session. Redirects to /login if there isn't
 * one. Use in Server Components / Route Handlers / Server Actions
 * that require any authenticated user.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

/**
 * Enforces a minimum role level.
 *
 * Role hierarchy (highest → lowest):
 *   SUPER_ADMIN > ADMIN > EMPLOYEE
 *
 * Passing "ADMIN" allows SUPER_ADMIN through as well — this keeps all
 * existing admin-only server actions and pages working for SUPER_ADMIN
 * without modifying every call site.
 *
 * Passing "SUPER_ADMIN" grants access only to SUPER_ADMIN.
 * Passing "EMPLOYEE" allows any authenticated user through.
 *
 * This — not the proxy, not hidden nav items — is the actual
 * authorization boundary for privileged operations.
 */
export async function requireRole(role: Role) {
  const session = await requireAuth();
  const userRole = session.user.role;

  if (role === "EMPLOYEE") {
    // Only EMPLOYEE role — ADMIN/SUPER_ADMIN have separate flows.
    if (userRole !== "EMPLOYEE") {
      redirect("/dashboard");
    }
    return session;
  }

  if (role === "ADMIN") {
    // SUPER_ADMIN satisfies ADMIN-level access (hierarchical).
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      redirect("/dashboard");
    }
    return session;
  }

  if (role === "SUPER_ADMIN") {
    // Only SUPER_ADMIN satisfies SUPER_ADMIN-level access.
    if (userRole !== "SUPER_ADMIN") {
      redirect("/dashboard");
    }
    return session;
  }

  redirect("/dashboard");
}

/**
 * Convenience alias — enforces SUPER_ADMIN only.
 * Use in /admins pages and admin-management server actions.
 */
export async function requireSuperAdmin() {
  return requireRole("SUPER_ADMIN");
}
