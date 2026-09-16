import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Activate Account — AssetFlow",
};

export default async function RegisterPage() {
  const session = await auth();

  // Already fully authenticated → go to dashboard.
  if (session?.user && !session.user.onboardingRequired) {
    redirect("/dashboard");
  }

  // Authenticated but in onboarding (Google path) → they should be at /onboarding.
  if (session?.user && session.user.onboardingRequired) {
    redirect("/onboarding");
  }

  return <RegisterForm />;
}
