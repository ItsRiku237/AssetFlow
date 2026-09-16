import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth-guards";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Defense in depth: the proxy already redirects unauthenticated
  // and not-yet-onboarded requests, but this layout enforces both
  // independently so it can't be bypassed.
  const session = await requireAuth();

  if (session.user.onboardingRequired) {
    redirect("/onboarding");
  }

  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <Sidebar role={session.user.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={session.user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
