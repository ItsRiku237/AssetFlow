export default function AuditLogsLoading() {
  return (
    <div className="space-y-5">
      {/* Hero skeleton */}
      <div className="glass-panel h-24 animate-pulse rounded-xl" />
      {/* Filters skeleton */}
      <div className="glass-panel h-14 animate-pulse rounded-xl" />
      {/* Table skeleton */}
      <div className="glass-panel overflow-hidden rounded-xl">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-border/30 px-4 py-3 last:border-0"
          >
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="h-3 w-32 animate-pulse rounded bg-muted" />
            <div className="h-5 w-28 animate-pulse rounded-full bg-muted" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
            <div className="ml-auto h-3 w-20 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
