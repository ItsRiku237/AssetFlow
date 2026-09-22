import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ActivationForm } from "@/components/auth/activation-form";

export const metadata = {
  title: "Activate Account — AssetFlow",
};

export default async function RegisterPage() {
  const session = await auth();

  if (session?.user && !session.user.onboardingRequired) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto w-full max-w-md animate-af-fade-up">
      <div className="glass-panel rounded-2xl p-6 shadow-xl">
        <div className="mb-6 space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Activate your account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your Employee ID and company email to get started.
          </p>
        </div>
        <ActivationForm />
      </div>
    </div>
  );
}
