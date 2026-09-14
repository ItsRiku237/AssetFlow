"use server";

import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";

export type LoginActionState = { error: string | null };

export async function authenticateWithCredentials(
  redirectTo: string,
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo,
    });
    return { error: null };
  } catch (error) {
    // Auth.js throws a redirect internally on success — rethrow
    // anything that isn't an auth failure.
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    throw error;
  }
}

export async function signInWithGoogle(redirectTo: string) {
  await signIn("google", { redirectTo });
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
