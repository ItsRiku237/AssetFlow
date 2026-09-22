import type { LucideIcon } from "lucide-react";

import { GlassCard } from "@/components/design-system/glass-card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning" | "destructive" | "purple";
}

const TONE_ICON_CLASSES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-primary",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
  purple: "text-[var(--glow-purple)]",
};

const TONE_GLOW: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "var(--glow-blue)",
  success: "var(--success)",
  warning: "var(--warning)",
  destructive: "var(--destructive)",
  purple: "var(--glow-purple)",
};

const TONE_TINT: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "var(--glow-blue)",
  success: "var(--success)",
  warning: "var(--warning)",
  destructive: "var(--destructive)",
  purple: "var(--glow-purple)",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: StatCardProps) {
  return (
    <GlassCard
      interactive
      className="min-w-0 p-3 sm:p-4"
      style={{
        background: `linear-gradient(160deg, color-mix(in oklab, ${TONE_TINT[tone]} 10%, var(--glass-bg)), var(--glass-bg))`,
      }}
    >
      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
        <div
          className={cn(
            "glow-icon-chip flex size-10 shrink-0 items-center justify-center rounded-lg",
            TONE_ICON_CLASSES[tone]
          )}
          style={{
            boxShadow: `0 0 20px -8px ${TONE_GLOW[tone]}`,
          }}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tabular-nums tracking-tight">
            {value}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
