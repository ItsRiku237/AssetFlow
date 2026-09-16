import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";
import { getSafeRedirect } from "@/lib/safe-redirect";

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl } = await searchParams;
  const redirectTo = getSafeRedirect(callbackUrl);

  const session = await auth();
  if (session?.user) {
    // A user who just completed Google sign-in but hasn't entered their
    // Employee ID yet must go to /onboarding, not to the dashboard.
    if (session.user.onboardingRequired) {
      redirect("/onboarding");
    }
    redirect(redirectTo);
  }

  return <LoginForm callbackUrl={redirectTo} />;
}
