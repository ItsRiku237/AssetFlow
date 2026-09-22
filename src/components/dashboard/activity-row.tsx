import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface ActivityRowProps {
  primary: string;
  secondary?: string;
  meta?: string;
  badge?: ReactNode;
  /** Optional leading icon chip — purely decorative, omit for unchanged layout. */
  icon?: LucideIcon;
}

export function ActivityRow({
  primary,
  secondary,
  meta,
  badge,
  icon: Icon,
}: ActivityRowProps) {
  return (
    <div className="-mx-1 flex items-center justify-between gap-3 rounded-md border-b border-border/70 px-1 py-2.5 text-sm transition-colors last:border-0 last:pb-0 hover:bg-accent/40">
      <div className="flex min-w-0 items-center gap-3">
        {Icon ? (
          <span className="glow-icon-chip flex size-8 shrink-0 items-center justify-center rounded-lg text-primary">
            <Icon className="size-4" />
          </span>
        ) : null}
        <div className="min-w-0">
          <p className="truncate font-medium">{primary}</p>
          {secondary ? (
            <p className="truncate text-xs text-muted-foreground">{secondary}</p>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {badge}
        {meta ? <span className="text-xs text-muted-foreground">{meta}</span> : null}
      </div>
    </div>
  );
}
