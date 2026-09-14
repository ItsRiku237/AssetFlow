export default function EmployeesLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
      <div className="h-9 w-full max-w-2xl animate-pulse rounded-md bg-muted" />
      <div className="h-64 w-full animate-pulse rounded-lg bg-muted" />
    </div>
  );
}
