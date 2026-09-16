import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";

import authConfig from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validations/auth";
import type { Role } from "@/types/role";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  providers: [
    Google,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,

    /**
     * Fired after every successful sign-in (credentials or OAuth).
     * For Google: if this User has no linked Employee record, mark
     * them as requiring onboarding — do NOT grant dashboard access.
     * For credentials: onboarding flag is already set correctly
     * (false for seeded/existing users, true if somehow a new
     * credentials user was created without an Employee link).
     */
    async signIn({ user, account }) {
      // Only run for Google OAuth (credentials authorize() already
      // returned null for unknown users, so they can't reach here).
      if (account?.provider !== "google") return true;

      if (!user.email) return false;

      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
        select: { id: true, employee: { select: { id: true } }, onboardingRequired: true },
      });

      if (!dbUser) {
        // Brand-new Google user — the Prisma adapter will create the
        // User row. We need to mark it as needing onboarding.
        // We can't update it here (row doesn't exist yet), so we set
        // a flag that the jwt callback will write after adapter creation.
        // Attach a marker on the user object to signal the jwt callback.
        (user as unknown as Record<string, unknown>).__needsOnboarding = true;
        return true;
      }

      // Existing user who has a linked Employee record → fine.
      if (dbUser.employee !== null) return true;

      // Existing user with NO Employee link → must onboard.
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { onboardingRequired: true },
      });
      return true;
    },

    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role as Role;
      }

      // If the signIn callback flagged this as a new Google user that
      // needs onboarding, write the flag to DB now (the adapter has
      // created the row by the time jwt fires) and stamp the token.
      if ((user as unknown as Record<string, unknown> | undefined)?.__needsOnboarding) {
        await prisma.user.update({
          where: { id: user!.id as string },
          data: { onboardingRequired: true },
        });
        token.onboardingRequired = true;
      }

      // On token refresh/session check, re-read the flag from DB so
      // it reflects the moment onboarding completes.
      if (trigger === "update" || (!user && token.id)) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { onboardingRequired: true, role: true },
        });
        if (dbUser) {
          token.onboardingRequired = dbUser.onboardingRequired;
          token.role = dbUser.role as Role;
        }
      }

      return token;
    },

    // `session` is inherited from authConfig.callbacks — adds id/role.
    // We also expose onboardingRequired so client/proxy can gate access.
  },
});
