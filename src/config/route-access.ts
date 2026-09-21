/**
 * Central map of which top-level route each role may access.
 * Consulted by `src/proxy.ts` (edge, cookie/JWT only) and by the
 * server-side guards in `src/lib/auth-guards.ts` (defense in depth —
 * the proxy alone is never treated as sufficient authorization).
 *
 * Role hierarchy: SUPER_ADMIN > ADMIN > EMPLOYEE
 * "ADMIN" in this file means "ADMIN or SUPER_ADMIN" (the middleware
 * and auth-guards both apply the hierarchy).
 */

/** Routes only a SUPER_ADMIN may load. */
export const SUPER_ADMIN_ONLY_ROUTES = ["/admins"] as const;

/** Routes only an ADMIN (or SUPER_ADMIN) may load. */
export const ADMIN_ONLY_ROUTES = [
  "/employees",
  "/assignments",
  "/repairs",
  "/audit-logs",
  "/asset-requests",
] as const;

/** Routes only an EMPLOYEE may load. */
export const EMPLOYEE_ONLY_ROUTES = ["/my-assets", "/available-assets"] as const;

/** Routes any authenticated user may load, regardless of role. */
export const SHARED_ROUTES = [
  "/dashboard",
  "/return-requests",
  "/reimbursements",
  "/profile",
  "/settings",
] as const;

/** Public routes that never require a session. */
export const PUBLIC_ROUTES = ["/login"] as const;

// Asset list/create/edit are admin-only; a single asset's detail page
// (/assets/:id, no further segment) is shared — an employee may load
// it, but only for an asset actually assigned to them. That ownership
// check happens inside the page itself (see app/(dashboard)/assets/[id]/page.tsx),
// since it depends on data the proxy/edge layer can't see.
const ASSET_EDIT_PATTERN = /^\/assets\/[^/]+\/edit$/;
const ASSET_DETAIL_PATTERN = /^\/assets\/[^/]+$/;

export function getRequiredRole(
  pathname: string
): "SUPER_ADMIN" | "ADMIN" | "EMPLOYEE" | "both" | null {
  // SUPER_ADMIN-only routes.
  if (SUPER_ADMIN_ONLY_ROUTES.some((route) => pathname.startsWith(route))) {
    return "SUPER_ADMIN";
  }

  if (pathname === "/assets" || pathname === "/assets/new") return "ADMIN";
  if (ASSET_EDIT_PATTERN.test(pathname)) return "ADMIN";
  if (ASSET_DETAIL_PATTERN.test(pathname)) return "both";

  if (ADMIN_ONLY_ROUTES.some((route) => pathname.startsWith(route))) {
    return "ADMIN";
  }
  if (EMPLOYEE_ONLY_ROUTES.some((route) => pathname.startsWith(route))) {
    return "EMPLOYEE";
  }
  if (SHARED_ROUTES.some((route) => pathname.startsWith(route))) {
    return "both";
  }
  return null;
}
