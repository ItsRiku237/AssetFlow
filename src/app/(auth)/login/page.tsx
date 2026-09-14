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
    redirect(redirectTo);
  }

  return <LoginForm callbackUrl={redirectTo} />;
}
