import type { ReactNode } from "react";

interface ActivityRowProps {
  primary: string;
  secondary?: string;
  meta?: string;
  badge?: ReactNode;
}

export function ActivityRow({ primary, secondary, meta, badge }: ActivityRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-2 text-sm last:border-0 last:pb-0">
      <div className="min-w-0">
        <p className="truncate font-medium">{primary}</p>
        {secondary ? (
          <p className="truncate text-xs text-muted-foreground">{secondary}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {badge}
        {meta ? <span className="text-xs text-muted-foreground">{meta}</span> : null}
      </div>
    </div>
  );
}
