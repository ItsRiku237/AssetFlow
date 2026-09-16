import type { DefaultSession } from "next-auth";
import type { Role } from "@/types/role";

declare module "next-auth" {
  interface User {
    role: Role;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      onboardingRequired: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    onboardingRequired?: boolean;
  }
}
