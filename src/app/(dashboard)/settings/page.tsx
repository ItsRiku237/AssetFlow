import Link from "next/link";
import { notFound } from "next/navigation";
import { Bell, KeyRound, Palette, ShieldCheck, UserCircle } from "lucide-react";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { ThemeSettings } from "@/components/settings/theme-settings";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth-guards";
import { getSettingsData } from "@/lib/data/settings";

export default async function SettingsPage() {
  const session = await requireAuth();
  const settings = await getSettingsData(session.user.id);
  if (!settings) notFound();

  const isAdmin = settings.account.role === "ADMIN" || settings.account.role === "SUPER_ADMIN";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your appearance, notifications, and account security."
      />

      <DashboardSection
        title="Account"
        description="Your identity and role are managed by your administrator."
      >
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-2 text-sm">
            <UserCircle className="size-4 text-muted-foreground" />
            <span className="font-medium">{settings.account.name}</span>
            <span className="text-muted-foreground">· {settings.account.email}</span>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/profile">View profile</Link>
          </Button>
        </div>
      </DashboardSection>

      <DashboardSection
        title="Appearance"
        description="Choose how AssetFlow looks on this device."
      >
        <div className="flex items-center gap-3">
          <Palette className="size-4 shrink-0 text-muted-foreground" />
          <div className="w-full max-w-md">
            <ThemeSettings />
          </div>
        </div>
      </DashboardSection>

      <DashboardSection
        title="Notifications"
        description="Notifications are delivered in-app."
      >
        <div className="flex items-start gap-3 rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
          <Bell className="mt-0.5 size-4 shrink-0" />
          <p>
            You&apos;ll see new activity in the notification bell in the top
            bar, and can mark items read from there. There are no separate
            email or push notification settings to configure.
          </p>
        </div>
      </DashboardSection>

      <DashboardSection
        title="Security"
        description={
          settings.hasPassword
            ? "Update the password used to sign in."
            : "This account signs in with Google."
        }
      >
        {settings.hasPassword ? (
          <ChangePasswordForm />
        ) : (
          <div className="flex items-start gap-3 rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
            <KeyRound className="mt-0.5 size-4 shrink-0" />
            <p>
              This account authenticates through Google Sign-In, so there is
              no AssetFlow password to change here.
            </p>
          </div>
        )}
      </DashboardSection>

      {isAdmin && settings.account.role === "SUPER_ADMIN" ? (
        <DashboardSection
          title="Administration"
          description="Elevated settings available only to super-admins."
        >
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-muted/30 p-3">
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheck className="size-4 text-muted-foreground" />
              <span>Manage administrator accounts and access.</span>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/admins">Open admin management</Link>
            </Button>
          </div>
        </DashboardSection>
      ) : null}
    </div>
  );
}
