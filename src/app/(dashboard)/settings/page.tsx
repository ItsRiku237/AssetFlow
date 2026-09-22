import Link from "next/link";
import { notFound } from "next/navigation";
import { Bell, KeyRound, Palette, Settings, ShieldCheck, UserCircle } from "lucide-react";

import { FadeIn } from "@/components/design-system/fade-in";
import { GlassCard } from "@/components/design-system/glass-card";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { ThemeSettings } from "@/components/settings/theme-settings";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth-guards";
import { getSettingsData } from "@/lib/data/settings";

interface SettingsSectionProps {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
  delay?: number;
}

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
  delay = 0,
}: SettingsSectionProps) {
  return (
    <FadeIn delay={delay}>
      <GlassCard className="overflow-hidden">
        {/* Section header */}
        <div className="flex items-center gap-3 border-b border-border/50 px-5 py-4">
          <div className="glow-icon-chip flex size-8 shrink-0 items-center justify-center rounded-lg text-primary">
            <Icon className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        {/* Section body */}
        <div className="px-5 py-4">{children}</div>
      </GlassCard>
    </FadeIn>
  );
}

export default async function SettingsPage() {
  const session = await requireAuth();
  const settings = await getSettingsData(session.user.id);
  if (!settings) notFound();

  const isSuperAdmin = settings.account.role === "SUPER_ADMIN";
  const isAdmin = settings.account.role === "ADMIN" || isSuperAdmin;

  return (
    <div className="space-y-5">
      {/* ── Hero ────────────────────────────────────────────────── */}
      <FadeIn>
        <GlassCard className="relative overflow-hidden px-6 py-5 sm:px-8">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-grid-pattern opacity-20 [mask-image:linear-gradient(to_bottom,#000,transparent)]" />
            <div
              className="animate-af-glow-pulse absolute -right-12 -top-10 size-52 rounded-full opacity-25 blur-[70px]"
              style={{ background: "radial-gradient(circle, var(--glow-cyan), transparent 70%)" }}
            />
          </div>
          <div className="relative flex items-center gap-3">
            <div className="glow-icon-chip flex size-11 shrink-0 items-center justify-center rounded-xl text-primary">
              <Settings className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Preferences
              </p>
              <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
              <p className="text-sm text-muted-foreground">
                Manage your appearance, notifications, and account security.
              </p>
            </div>
          </div>
        </GlassCard>
      </FadeIn>

      {/* ── Account ─────────────────────────────────────────────── */}
      <SettingsSection
        icon={UserCircle}
        title="Account"
        description="Your identity and role are managed by your administrator."
        delay={60}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-3 text-sm min-w-0">
            <div className="glow-icon-chip flex size-8 shrink-0 items-center justify-center rounded-lg text-primary">
              <UserCircle className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">{settings.account.name}</p>
              <p className="text-xs text-muted-foreground truncate">{settings.account.email}</p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/profile">View profile</Link>
          </Button>
        </div>
      </SettingsSection>

      {/* ── Appearance ──────────────────────────────────────────── */}
      <SettingsSection
        icon={Palette}
        title="Appearance"
        description="Choose how AssetFlow looks on this device."
        delay={120}
      >
        <div className="max-w-xs">
          <ThemeSettings />
        </div>
      </SettingsSection>

      {/* ── Notifications ───────────────────────────────────────── */}
      <SettingsSection
        icon={Bell}
        title="Notifications"
        description="Notifications are delivered in-app."
        delay={180}
      >
        <div className="flex items-start gap-3 rounded-xl border border-dashed border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          <Bell className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p>
            New activity appears in the notification bell in the top bar.
            Mark items read from there — no separate email or push notification
            settings are required.
          </p>
        </div>
      </SettingsSection>

      {/* ── Security ────────────────────────────────────────────── */}
      <SettingsSection
        icon={KeyRound}
        title="Security"
        description={
          settings.hasPassword
            ? "Update the password used to sign in to AssetFlow."
            : "This account authenticates with Google Sign-In."
        }
        delay={240}
      >
        {settings.hasPassword ? (
          <div className="max-w-lg">
            <ChangePasswordForm />
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-xl border border-dashed border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            <KeyRound className="mt-0.5 size-4 shrink-0" />
            <p>
              This account uses Google Sign-In, so there is no AssetFlow
              password to update here.
            </p>
          </div>
        )}
      </SettingsSection>

      {/* ── Administration (Super Admin only) ───────────────────── */}
      {isSuperAdmin ? (
        <SettingsSection
          icon={ShieldCheck}
          title="Administration"
          description="Elevated settings available only to super-admins."
          delay={300}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheck className="size-4 text-primary" />
              <span className="font-medium">Admin Management</span>
              <span className="text-muted-foreground">
                · Manage administrator accounts and access.
              </span>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/admins">Open</Link>
            </Button>
          </div>
        </SettingsSection>
      ) : null}
    </div>
  );
}
