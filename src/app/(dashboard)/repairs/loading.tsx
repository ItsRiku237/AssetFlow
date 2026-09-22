import { GlassCard } from "@/components/design-system/glass-card";

export default function RepairsLoading() {
  return (
    <div className="space-y-6">
      {/* Hero skeleton */}
      <GlassCard className="px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-11 animate-pulse rounded-xl bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-44 animate-pulse rounded-md bg-muted" />
              <div className="h-3 w-64 animate-pulse rounded-md bg-muted" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
            <div className="h-6 w-28 animate-pulse rounded-full bg-muted" />
            <div className="h-6 w-28 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </GlassCard>

      {/* In repair table skeleton */}
      <GlassCard className="overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border/60 px-5 py-3">
          <div className="size-7 animate-pulse rounded-lg bg-muted" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-32 animate-pulse rounded-md bg-muted" />
            <div className="h-3 w-56 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
        <div className="divide-y divide-border/40">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5">
              <div className="size-8 animate-pulse rounded-lg bg-muted" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-40 animate-pulse rounded-md bg-muted" />
                <div className="h-3 w-24 animate-pulse rounded-md bg-muted" />
              </div>
              <div className="h-3 w-20 animate-pulse rounded-md bg-muted" />
              <div className="h-7 w-28 animate-pulse rounded-md bg-muted" />
            </div>
          ))}
        </div>
      </GlassCard>

      {/* History table skeleton */}
      <GlassCard className="overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border/60 px-5 py-3">
          <div className="size-7 animate-pulse rounded-lg bg-muted" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-40 animate-pulse rounded-md bg-muted" />
            <div className="h-3 w-44 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
        <div className="divide-y divide-border/40">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5">
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-36 animate-pulse rounded-md bg-muted" />
                <div className="h-3 w-52 animate-pulse rounded-md bg-muted" />
              </div>
              <div className="h-3 w-16 animate-pulse rounded-md bg-muted" />
              <div className="h-3 w-20 animate-pulse rounded-md bg-muted" />
              <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
