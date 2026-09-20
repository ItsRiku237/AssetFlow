/**
 * Mirrors the `Role` enum in prisma/schema.prisma. Kept as a plain
 * string union (instead of importing from `@prisma/client`) so
 * edge-safe modules — `auth.config.ts`, `proxy.ts` — never pull the
 * Prisma runtime into the edge bundle.
 */
export type Role = "SUPER_ADMIN" | "ADMIN" | "EMPLOYEE";
