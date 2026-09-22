interface DashboardHeroProps {
  name: string | null | undefined;
  subtitle: string;
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/**
 * Premium hero banner for the Admin Dashboard. Self-contained decorative
 * background (CSS gradients + grid, no external image) so real artwork
 * can be dropped in later without touching this component's structure.
 */
export function DashboardHero({ name, subtitle }: DashboardHeroProps) {
  return (
    <div className="glass-panel animate-af-fade-up relative overflow-hidden rounded-xl px-6 py-8 sm:px-8">
      {/* Decorative background layer */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-30 [mask-image:linear-gradient(to_bottom,#000,transparent)]" />
        <div
          className="animate-af-glow-pulse absolute -right-16 -top-20 size-72 rounded-full opacity-40 blur-[90px]"
          style={{
            background:
              "radial-gradient(circle, var(--glow-cyan), transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-24 left-10 size-64 rounded-full opacity-25 blur-[90px]"
          style={{
            background:
              "radial-gradient(circle, var(--glow-purple), transparent 70%)",
          }}
        />
      </div>

      <div className="relative space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {greeting()}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Welcome back
          {name ? (
            <>
              {", "}
              <span className="text-gradient-brand">{name}</span>
            </>
          ) : null}{" "}
          👋
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
