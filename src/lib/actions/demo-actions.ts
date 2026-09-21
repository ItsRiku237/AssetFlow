"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import {
  DEMO_ADMIN_EMAIL,
  DEMO_EMPLOYEE_EMAIL,
  DEMO_SUPER_ADMIN_EMAIL,
  getDemoAdminPassword,
  getDemoEmployeePassword,
  getDemoSuperAdminPassword,
} from "@/lib/demo";

export type DemoSignInState = { error: string | null };

/**
 * Sign in as the demo ADMIN account.
 *
 * The demo password is read server-side (lib/demo.ts) and never sent
 * to or stored in the client — this is a plain server action, not a
 * form posting a hidden password field.
 */
export async function signInAsDemoAdmin(): Promise<DemoSignInState> {
  try {
    await signIn("credentials", {
      email: DEMO_ADMIN_EMAIL,
      password: getDemoAdminPassword(),
      redirectTo: "/dashboard",
    });
    return { error: null };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error:
          "Demo admin sign-in is temporarily unavailable. Please try again shortly.",
      };
    }
    throw error;
  }
}

/**
 * Sign in as the demo EMPLOYEE account.
 */
export async function signInAsDemoEmployee(): Promise<DemoSignInState> {
  try {
    await signIn("credentials", {
      email: DEMO_EMPLOYEE_EMAIL,
      password: getDemoEmployeePassword(),
      redirectTo: "/dashboard",
    });
    return { error: null };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error:
          "Demo employee sign-in is temporarily unavailable. Please try again shortly.",
      };
    }
    throw error;
  }
}

/**
 * Sign in as the demo SUPER_ADMIN account. The stored role is ADMIN;
 * the SUPER_ADMIN role is granted only in the session (see
 * resolveSessionRole in lib/demo.ts).
 */
export async function signInAsDemoSuperAdmin(): Promise<DemoSignInState> {
  try {
    await signIn("credentials", {
      email: DEMO_SUPER_ADMIN_EMAIL,
      password: getDemoSuperAdminPassword(),
      redirectTo: "/dashboard",
    });
    return { error: null };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error:
          "Demo super admin sign-in is temporarily unavailable. Please try again shortly.",
      };
    }
    throw error;
  }
}
