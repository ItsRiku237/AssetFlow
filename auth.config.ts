import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

import { getRequiredRole } from "@/config/route-access";
import type { Role } from "@/types/role";

/**
 * Returns true when the user's role satisfies the required role level.
 * Role hierarchy: SUPER_ADMIN > ADMIN > EMPLOYEE
 */
function roleAllowed(
  userRole: Role,
  requiredRole: "SUPER_ADMIN" | "ADMIN" | "EMPLOYEE" | "both"
): boolean {
  if (requiredRole === "both") return true;
  if (requiredRole === "EMPLOYEE") return true; // any authenticated role
  if (requiredRole === "ADMIN")
    return userRole === "ADMIN" || userRole === "SUPER_ADMIN";
  if (requiredRole === "SUPER_ADMIN") return userRole === "SUPER_ADMIN";
  return false;
}

export default {
  providers: [Google, Credentials({ credentials: {} })],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const pathname = request.nextUrl.pathname;
      const requiredRole = getRequiredRole(pathname);

      // Onboarding page is always reachable by any logged-in user.
      if (pathname.startsWith("/onboarding")) {
        return isLoggedIn;
      }

      // Public and unmatched routes (including /register).
      if (requiredRole === null) return true;

      if (!isLoggedIn) return false;

      // A user with onboardingRequired must complete onboarding before
      // accessing any protected route. Redirect them to /onboarding
      // (returning a Response redirect rather than false avoids sending
      // them to /login, which would loop back to /dashboard and trigger
      // this check again).
      const tokenUser = (auth as unknown as { user?: { onboardingRequired?: boolean; status?: string } })?.user;
      const needsOnboarding = tokenUser?.onboardingRequired === true;
      const isDeactivated = tokenUser?.status === "DEACTIVATED";

      // Deactivated admin accounts: block all protected routes and
      // show a dedicated page — NOT the employee onboarding flow.
      if (isDeactivated) {
        if (pathname === "/login" || pathname === "/deactivated") return true;
        const url = request.nextUrl.clone();
        url.pathname = "/deactivated";
        return Response.redirect(url);
      }

      if (needsOnboarding) {
        // Allow /login so they can switch accounts without looping.
        if (pathname === "/login") return true;
        // For everything else, redirect to onboarding.
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        return Response.redirect(url);
      }

      const userRole = auth.user.role as Role;
      return roleAllowed(userRole, requiredRole);
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.onboardingRequired = (token.onboardingRequired ?? false) as boolean;
        session.user.status = (token.status ?? "ACTIVE") as "ACTIVE" | "DEACTIVATED";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
