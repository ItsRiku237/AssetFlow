/**
 * Ambient background for the authenticated app shell: a restrained tech
 * image, atmospheric gradients, and a subtle grid. The image is decorative
 * and intentionally softened so it adds depth without competing with UI.
 *
 * Rendered once behind the sidebar/topbar/main stack in the dashboard
 * layout. `pointer-events-none` and negative z-index keep it fully
 * inert; it never intercepts clicks or reduces text contrast because all
 * real content sits on solid/glass surfaces above it.
 */
export function AppBackground() {
  return (
    <div
      aria-hidden
      className="af-background-system pointer-events-none fixed inset-0 z-0 overflow-hidden bg-background"
    >
      <div className="af-background-image absolute inset-0" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_40%,transparent_100%)]" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklab,var(--glow-blue)_14%,transparent),transparent_42%),radial-gradient(ellipse_at_bottom_right,color-mix(in_oklab,var(--glow-purple)_11%,transparent),transparent_42%)]" />

      <div
        className="animate-af-float absolute -left-32 -top-24 size-[420px] rounded-full opacity-25 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, var(--glow-cyan), transparent 70%)",
        }}
      />
      <div
        className="animate-af-float absolute -right-24 top-1/3 size-[380px] rounded-full opacity-20 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, var(--glow-purple), transparent 70%)",
          animationDelay: "-3s",
        }}
      />
      <div
        className="animate-af-glow-pulse absolute bottom-0 left-1/3 size-[320px] rounded-full opacity-15 blur-[110px]"
        style={{
          background:
            "radial-gradient(circle, var(--glow-blue), transparent 70%)",
        }}
      />
    </div>
  );
}
