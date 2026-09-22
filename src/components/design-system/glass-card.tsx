import type { ReactNode, HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Adds a subtle cyan glow + lift on hover. Use for interactive cards. */
  interactive?: boolean;
  /** Adds a permanent soft glow ring (use sparingly — one or two per screen). */
  glow?: boolean;
}

/**
 * Base glass surface used across the premium design system: translucent
 * background, blurred backdrop, soft border. Purely presentational — wrap
 * any existing content in it without changing behavior.
 */
export function GlassCard({
  children,
  className,
  interactive = false,
  glow = false,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-panel rounded-xl",
        interactive && "glass-panel-hover",
        glow && "glow-ring",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
