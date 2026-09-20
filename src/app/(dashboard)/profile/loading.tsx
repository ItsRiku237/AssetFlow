export default function ProfileLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-36 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
      </div>

      <div className="h-28 w-full animate-pulse rounded-lg border border-border bg-card" />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-56 w-full animate-pulse rounded-lg border border-border bg-card" />
        <div className="h-56 w-full animate-pulse rounded-lg border border-border bg-card" />
        <div className="h-44 w-full animate-pulse rounded-lg border border-border bg-card lg:col-span-2" />
      </div>

      <div className="h-48 w-full animate-pulse rounded-lg border border-border bg-card" />
    </div>
  );
}
