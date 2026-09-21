import "server-only";

import { prisma } from "@/lib/prisma";
import type { Role } from "@/types/role";

/**
 * Central configuration and server-side guards for the public Demo Mode
 * (Task 21, Part C).
 *
 * Demo accounts are ordinary User/Employee rows distinguished only by a
 * fixed, well-known email address and employee code — no schema change
 * is needed. Demo-owned business records (assets) are distinguished by
 * an assetTag prefix. This keeps demo data fully isolated using the
 * existing schema:
 *
 *   - Demo accounts can only be reached by signing in with these exact
 *     credentials via the /demo entry point (server action — the
 *     password never reaches the client).
 *   - A demo ADMIN session is still a real ADMIN role, so it is further
 *     restricted here from mutating any asset/employee that is NOT
 *     tagged as demo data. This is enforced in the server actions
 *     themselves, not just hidden in the UI.
 */

export const DEMO_ADMIN_EMAIL = "demo-admin@assetflow.dev";
export const DEMO_EMPLOYEE_EMAIL = "demo-employee@assetflow.dev";
/**
 * The demo Super Admin is NOT a SUPER_ADMIN row in the database. Its
 * User row is stored with role ADMIN; the SUPER_ADMIN role exists only
 * in the session, granted by resolveSessionRole() below.
 */
export const DEMO_SUPER_ADMIN_EMAIL = "demo-super-admin@assetflow.dev";
export const DEMO_EMPLOYEE_CODE = "DEMO-0001";

/**
 * Admin-management scope: a demo session may only list/manage admin
 * accounts whose email matches this prefix + suffix.
 */
export const DEMO_ADMIN_EMAIL_PREFIX = "demo-";
export const DEMO_ADMIN_EMAIL_SUFFIX = "@assetflow.dev";

/** Prefix applied to every asset tag that belongs to the demo dataset. */
export const DEMO_ASSET_TAG_PREFIX = "DEMO-";
/** Prefix applied to every employee code that belongs to the demo dataset. */
export const DEMO_EMPLOYEE_CODE_PREFIX = "DEMO-";

export function isDemoAccountEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase();
  return (
    normalized === DEMO_ADMIN_EMAIL ||
    normalized === DEMO_EMPLOYEE_EMAIL ||
    normalized === DEMO_SUPER_ADMIN_EMAIL
  );
}

export function isDemoSuperAdminEmail(email: string | null | undefined): boolean {
  return !!email && email.toLowerCase() === DEMO_SUPER_ADMIN_EMAIL;
}

/** True for any email inside the demo admin-management scope. */
export function isDemoScopedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase();
  return (
    normalized.startsWith(DEMO_ADMIN_EMAIL_PREFIX) &&
    normalized.endsWith(DEMO_ADMIN_EMAIL_SUFFIX)
  );
}

/**
 * Maps a stored (database) role to the role exposed in the session.
 * Only the demo Super Admin's ADMIN row is elevated; every other user
 * keeps their stored role, so production authentication is unchanged.
 * `email` must come from the database row, never from client input.
 */
export function resolveSessionRole(
  dbRole: Role,
  email: string | null | undefined
): Role {
  if (dbRole === "ADMIN" && isDemoSuperAdminEmail(email)) return "SUPER_ADMIN";
  return dbRole;
}

export function isDemoAssetTag(assetTag: string | null | undefined): boolean {
  return !!assetTag && assetTag.startsWith(DEMO_ASSET_TAG_PREFIX);
}

export function isDemoEmployeeCode(employeeCode: string | null | undefined): boolean {
  return !!employeeCode && employeeCode.startsWith(DEMO_EMPLOYEE_CODE_PREFIX);
}

/**
 * Demo-only passwords. Read from the environment so a deployer can
 * rotate them; fall back to fixed demo-only defaults (these accounts
 * hold no real data and are not the protected owner account).
 */
export function getDemoAdminPassword(): string {
  return process.env.DEMO_ADMIN_PASSWORD || "DemoAdmin@2026";
}

export function getDemoEmployeePassword(): string {
  return process.env.DEMO_EMPLOYEE_PASSWORD || "DemoEmployee@2026";
}

export function getDemoSuperAdminPassword(): string {
  return process.env.DEMO_SUPER_ADMIN_PASSWORD || "DemoSuperAdmin@2026";
}

// ─── Server-side mutation guards ────────────────────────────────────────────
// Call these at the top of any admin mutation that targets an existing
// asset or employee. They are a no-op for non-demo sessions.

export class DemoScopeError extends Error {}

/**
 * Throws if `actorEmail` belongs to a demo account and the target asset
 * is not itself demo data. Never trust the client-supplied assetId.
 */
export async function assertDemoAssetScope(
  actorEmail: string | null | undefined,
  assetId: string
): Promise<void> {
  if (!isDemoAccountEmail(actorEmail)) return;

  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    select: { assetTag: true },
  });

  if (!asset || !isDemoAssetTag(asset.assetTag)) {
    throw new DemoScopeError(
      "Demo accounts can only modify demo-tagged assets."
    );
  }
}

/**
 * Throws if `actorEmail` belongs to a demo account and the target
 * employee is not itself the demo employee.
 */
export async function assertDemoEmployeeScope(
  actorEmail: string | null | undefined,
  employeeId: string
): Promise<void> {
  if (!isDemoAccountEmail(actorEmail)) return;

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { employeeCode: true },
  });

  if (!employee || !isDemoEmployeeCode(employee.employeeCode)) {
    throw new DemoScopeError(
      "Demo accounts can only modify the demo employee record."
    );
  }
}

/**
 * Throws if `actorEmail` belongs to a demo account and the target admin
 * is outside the demo admin scope, or is one of the built-in demo
 * accounts (which must stay intact for every visitor).
 */
export function assertDemoAdminManagementScope(
  actorEmail: string | null | undefined,
  targetEmail: string | null | undefined
): void {
  if (!isDemoAccountEmail(actorEmail)) return;

  if (!isDemoScopedAdminEmail(targetEmail) || isDemoAccountEmail(targetEmail)) {
    throw new DemoScopeError(
      "Demo mode can only manage admin accounts created inside the demo."
    );
  }
}
