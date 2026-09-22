export default function AdminsLoading() {
  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="glass-panel h-24 animate-pulse rounded-xl" />
      {/* Notice */}
      <div className="glass-panel h-12 animate-pulse rounded-xl" />
      {/* Table */}
      <div className="glass-panel overflow-hidden rounded-xl">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-border/30 px-4 py-3 last:border-0"
          >
            <div className="size-9 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-36 animate-pulse rounded bg-muted" />
              <div className="h-2.5 w-48 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
            <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
            <div className="ml-auto flex gap-1.5">
              <div className="h-7 w-20 animate-pulse rounded-md bg-muted" />
              <div className="h-7 w-14 animate-pulse rounded-md bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
