import Image from "next/image";
import { Shield, ShieldCheck, Users } from "lucide-react";

import { AdminTable } from "@/components/admins/admin-table";
import { InviteAdminDialog } from "@/components/admins/invite-admin-dialog";
import { FadeIn } from "@/components/design-system/fade-in";
import { GlassCard } from "@/components/design-system/glass-card";
import { EmptyState } from "@/components/shared/empty-state";
import { requireSuperAdmin } from "@/lib/auth-guards";
import { getAdmins } from "@/lib/data/admins";
import { isDemoAccountEmail } from "@/lib/demo";

export default async function AdminsPage() {
  const session = await requireSuperAdmin();
  const demoMode = isDemoAccountEmail(session.user.email);
  const admins = await getAdmins({ demoOnly: demoMode });

  const superAdmins = admins.filter((a) => a.role === "SUPER_ADMIN");
  const regularAdmins = admins.filter((a) => a.role === "ADMIN");
  const activeAdmins = regularAdmins.filter((a) => a.active).length;

  return (
    <div className="space-y-5">
      {/* ── Hero ────────────────────────────────────────────────── */}
      <FadeIn>
        <GlassCard className="relative overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/images/dashboard-hero.webp"
              alt=""
              fill
              className="object-cover opacity-10"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/96 via-background/88 to-background/70" />
          </div>
          {/* Glow accents */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-10 size-56 rounded-full opacity-20 blur-[80px]"
            style={{ background: "radial-gradient(circle, var(--glow-purple), transparent 70%)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-8 left-1/3 size-40 rounded-full opacity-15 blur-[60px]"
            style={{ background: "radial-gradient(circle, var(--glow-cyan), transparent 70%)" }}
          />

          <div className="relative flex flex-wrap items-center justify-between gap-4 px-6 py-6">
            <div className="flex items-center gap-3">
              <span className="glow-icon-chip flex size-12 items-center justify-center rounded-xl text-primary">
                <ShieldCheck className="size-6" />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Access Control
                </p>
                <h1 className="text-xl font-semibold tracking-tight">
                  Administrators
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage admin accounts and access levels.
                </p>
              </div>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/40 px-3 py-1.5 text-xs">
                <ShieldCheck className="size-3.5 text-primary" />
                <span className="text-muted-foreground">Super Admins</span>
                <span className="font-semibold tabular-nums">{superAdmins.length}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/40 px-3 py-1.5 text-xs">
                <Shield className="size-3.5 text-[var(--glow-purple)]" />
                <span className="text-muted-foreground">Active Admins</span>
                <span className="font-semibold tabular-nums">{activeAdmins}</span>
              </div>
              <InviteAdminDialog demoMode={demoMode} />
            </div>
          </div>
        </GlassCard>
      </FadeIn>

      {/* ── Notice ──────────────────────────────────────────────── */}
      <FadeIn delay={60}>
        <GlassCard className="flex items-start gap-3 px-4 py-3.5">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            Super-admin accounts are listed here for visibility but cannot be modified
            through this interface. Admin accounts can be invited and their access
            can be enabled or disabled at any time.
          </p>
        </GlassCard>
      </FadeIn>

      {/* ── Table / empty ───────────────────────────────────────── */}
      <FadeIn delay={120}>
        {admins.length === 0 ? (
          <GlassCard className="p-6">
            <EmptyState
              icon={Users}
              title="No administrators yet"
              description="Invite your first administrator using the button above."
            />
          </GlassCard>
        ) : (
          <GlassCard className="overflow-visible rounded-xl p-0">
            <AdminTable
              admins={admins}
              currentUserId={session.user.id}
              demoMode={demoMode}
            />
          </GlassCard>
        )}
      </FadeIn>
    </div>
  );
}
