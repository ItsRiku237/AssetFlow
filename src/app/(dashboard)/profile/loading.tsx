export default function ProfileLoading() {
  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="glass-panel h-28 animate-pulse rounded-xl" />
      {/* Two cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-panel h-52 animate-pulse rounded-xl" />
        <div className="glass-panel h-52 animate-pulse rounded-xl" />
      </div>
      {/* Wide org card */}
      <div className="glass-panel h-40 animate-pulse rounded-xl" />
      {/* Assets section */}
      <div className="glass-panel h-48 animate-pulse rounded-xl" />
    </div>
  );
}
