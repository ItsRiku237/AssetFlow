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
 * Same as `requireAuth`, but also enforces a specific role.
 * This — not the proxy, not hidden nav items — is the actual
 * authorization boundary for admin-only operations.
 */
export async function requireRole(role: Role) {
  const session = await requireAuth();
  if (session.user.role !== role) {
    redirect("/dashboard");
  }
  return session;
}
