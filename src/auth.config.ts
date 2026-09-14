import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

import { getRequiredRole } from "@/config/route-access";
import type { Role } from "@/types/role";

/**
 * Shared between the edge proxy (`src/proxy.ts`) and the full,
 * Node-only config (`src/auth.ts`). Must stay free of Prisma/bcrypt
 * imports — this file is bundled for the edge runtime.
 *
 * The Credentials provider is declared here only so its id/name are
 * known to `signIn("credentials", ...)` calls; its actual
 * `authorize` (which needs Prisma + bcrypt) is attached in
 * `src/auth.ts`, which is what the Node runtime actually uses.
 *
 * IMPORTANT: the `session` callback below is what makes `role`/`id`
 * available on `auth.user` inside the edge `authorized` callback.
 * Without it, Auth.js's default session shape only exposes
 * name/email/image, so every role-specific route check here would
 * silently evaluate to `undefined === "ADMIN"` (always false) even
 * for a real admin — which is exactly the /assets → /login →
 * /dashboard bounce this file previously caused. `src/auth.ts`
 * inherits this same callback via `...authConfig.callbacks` rather
 * than redefining it, so the two configs can't drift apart again.
 */
export default {
  providers: [Google, Credentials({ credentials: {} })],
  pages: {
    signIn: "/login",
  },
  session: {
    // Required: the Credentials provider does not support database
    // sessions, so the whole app uses JWT sessions.
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const pathname = request.nextUrl.pathname;
      const requiredRole = getRequiredRole(pathname);

      // Not one of our protected routes (e.g. /login, /api/auth/*) —
      // let it through.
      if (requiredRole === null) return true;

      if (!isLoggedIn) return false;

      if (requiredRole === "both") return true;

      return auth.user.role === requiredRole;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
