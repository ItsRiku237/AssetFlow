import type { ReactNode } from "react";
import Image from "next/image";
import { Boxes } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background p-4">
      {/* ── Background image layer ─────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Image
          src="/images/dashboard-hero.webp"
          alt=""
          fill
          className="object-cover opacity-[0.06] dark:opacity-[0.07]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/80" />
      </div>

      {/* ── Ambient glows ──────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {/* Grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.18] [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_80%)]" />
        {/* Cyan glow — top right */}
        <div
          className="animate-af-glow-pulse absolute -right-32 -top-32 size-[600px] rounded-full opacity-20 blur-[120px]"
          style={{ background: "radial-gradient(circle, var(--glow-cyan), transparent 65%)" }}
        />
        {/* Purple glow — bottom left */}
        <div
          className="absolute -bottom-32 -left-32 size-[500px] rounded-full opacity-15 blur-[120px]"
          style={{ background: "radial-gradient(circle, var(--glow-purple), transparent 65%)" }}
        />
        {/* Blue glow — center */}
        <div
          className="absolute left-1/2 top-1/3 size-[400px] -translate-x-1/2 rounded-full opacity-10 blur-[100px]"
          style={{ background: "radial-gradient(circle, var(--glow-blue), transparent 65%)" }}
        />
      </div>

      {/* ── Logo ───────────────────────────────────────────────── */}
      <div className="relative z-10 mb-6 flex items-center gap-2">
        <div className="glow-icon-chip flex size-9 items-center justify-center rounded-lg text-primary">
          <Boxes className="size-5" />
        </div>
        <span className="text-lg font-semibold tracking-tight">ADP AssetHub</span>
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      <div className="relative z-10 w-full">
        {children}
      </div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <p className="relative z-10 mt-8 text-center text-xs text-muted-foreground/50">
        Enterprise Asset Management Platform
      </p>
    </div>
  );
}
