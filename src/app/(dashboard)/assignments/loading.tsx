export default function AssignmentsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-44 animate-pulse rounded-md bg-muted" />
      <div className="grid grid-cols-3 gap-3 max-w-sm">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
      <div className="h-9 w-72 animate-pulse rounded-md bg-muted" />
      <div className="h-64 w-full animate-pulse rounded-lg bg-muted" />
    </div>
  );
}
