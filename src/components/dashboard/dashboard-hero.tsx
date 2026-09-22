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
 * Premium hero banner for the Admin Dashboard. The local artwork is kept
 * deliberately low contrast beneath the glass surface.
 */
export function DashboardHero({ name, subtitle }: DashboardHeroProps) {
  return (
    <div className="glass-panel animate-af-fade-up relative overflow-hidden rounded-xl px-6 py-8 sm:px-8">
      {/* Decorative background layer */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35 blur-[1px] dark:opacity-45"
          style={{ backgroundImage: "url('/images/dashboard-hero.webp')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/96 via-background/88 to-background/70 dark:from-[#070a12]/92 dark:via-[#070a12]/82 dark:to-[#070a12]/60" />
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
