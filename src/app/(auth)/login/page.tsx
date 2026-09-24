import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";
import { getSafeRedirect } from "@/lib/safe-redirect";

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl, error } = await searchParams;
  const redirectTo = getSafeRedirect(callbackUrl);

  const session = await auth();
  if (session?.user) {
    if (session.user.onboardingRequired) {
      redirect("/onboarding");
    }
    redirect(redirectTo);
  }

  return <LoginForm callbackUrl={redirectTo} authError={error} />;
}
