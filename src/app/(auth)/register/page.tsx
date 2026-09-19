import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ActivationForm } from "@/components/auth/activation-form";

export const metadata = {
  title: "Activate Account — AssetFlow",
};

export default async function RegisterPage() {
  const session = await auth();

  // Already fully authenticated → go to dashboard.
  if (session?.user && !session.user.onboardingRequired) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Activate your account</h1>
      <p className="text-sm text-muted-foreground">
        Enter your Employee ID and company email to get started.
      </p>
      <div className="pt-2">
        <ActivationForm />
      </div>
    </div>
  );
}
