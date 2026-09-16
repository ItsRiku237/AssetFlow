import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { OnboardingForm } from "@/components/auth/onboarding-form";
import { getSafeRedirect } from "@/lib/safe-redirect";

interface OnboardingPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function OnboardingPage({
  searchParams,
}: OnboardingPageProps) {
  const session = await auth();

  // Not logged in — send to login.
  if (!session?.user) {
    redirect("/login");
  }

  // Already onboarded — send to dashboard.
  if (!session.user.onboardingRequired) {
    redirect("/dashboard");
  }

  const { callbackUrl } = await searchParams;
  const redirectTo = getSafeRedirect(callbackUrl, "/dashboard");

  return <OnboardingForm redirectTo={redirectTo} />;
}
