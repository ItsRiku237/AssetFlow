import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

import { getRequiredRole } from "@/config/route-access";
import type { Role } from "@/types/role";

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
      const needsOnboarding = (
        auth as unknown as { user?: { onboardingRequired?: boolean } }
      )?.user?.onboardingRequired === true;

      if (needsOnboarding) {
        // Allow /login so they can switch accounts without looping.
        if (pathname === "/login") return true;
        // For everything else, redirect to onboarding.
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        return Response.redirect(url);
      }

      if (requiredRole === "both") return true;

      return auth.user.role === requiredRole;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.onboardingRequired = (token.onboardingRequired ?? false) as boolean;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
