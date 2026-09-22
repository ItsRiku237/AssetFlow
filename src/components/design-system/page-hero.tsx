import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageHeroProps {
  /** Background image path under /public (e.g. "/images/assets-hero.webp"). */
  imageSrc?: string;
  /** Overlay opacity class – defaults to a medium-dark overlay. */
  overlayClass?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Premium page hero banner following the visual hierarchy:
 *   BACKGROUND IMAGE → DARK OVERLAY → AMBIENT GLOW → GLASS SURFACE → CONTENT
 *
 * When `imageSrc` is provided the photo sits behind the overlay and glass.
 * If the image is absent the component falls back to gradient-only gracefully.
 */
export function PageHero({
  imageSrc,
  overlayClass,
  children,
  className,
}: PageHeroProps) {
  return (
    <div
      className={cn(
        "glass-panel animate-af-fade-up relative overflow-hidden rounded-xl",
        className
      )}
    >
      {/* ── Background image layer ──────────────────────────────── */}
      {imageSrc ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ) : null}

      {/* ── Dark/gradient overlay ───────────────────────────────── */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0",
          overlayClass ??
            "bg-gradient-to-r from-background/90 via-background/75 to-background/50 dark:from-[#070a12]/92 dark:via-[#070a12]/78 dark:to-[#070a12]/55"
        )}
      />

      {/* ── Ambient glow ────────────────────────────────────────── */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-20 [mask-image:linear-gradient(to_bottom,#000,transparent)]" />
        <div
          className="animate-af-glow-pulse absolute -right-16 -top-20 size-72 rounded-full opacity-35 blur-[90px]"
          style={{
            background:
              "radial-gradient(circle, var(--glow-cyan), transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-20 left-8 size-56 rounded-full opacity-20 blur-[80px]"
          style={{
            background:
              "radial-gradient(circle, var(--glow-purple), transparent 70%)",
          }}
        />
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="relative">{children}</div>
    </div>
  );
}
