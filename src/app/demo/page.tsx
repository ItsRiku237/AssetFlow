import { Boxes } from "lucide-react";

import { auth } from "@/auth";
import { DemoEntry } from "@/components/demo/demo-entry";

/**
 * Public demo entry point (Task 21, Part C).
 *
 * Not gated by the proxy (route-access.ts returns `null` for /demo,
 * so it's reachable whether or not a session exists) — this page is
 * meant to be shared with recruiters/interviewers without requiring
 * an account. The actual demo sign-in happens through the Credentials
 * provider via src/lib/actions/demo-actions.ts, which never exposes
 * the demo password to the client.
 */
export default async function DemoPage() {
  const session = await auth();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-background p-4">
      <div className="flex items-center gap-2 text-foreground">
        <Boxes className="size-6 text-primary" />
        <span className="text-lg font-semibold tracking-tight">
          ADP AssetHub
        </span>
      </div>

      <div className="max-w-2xl space-y-2 text-center">
        <h1 className="text-xl font-semibold">Try the live demo</h1>
        <p className="text-sm text-muted-foreground">
          Explore ADP AssetHub as an Employee, an Admin, or a Super Admin. Demo
          accounts use isolated demo data and can never modify real business
          records.
        </p>
      </div>

      <DemoEntry />

      {session?.user ? (
        <p className="text-xs text-muted-foreground">
          Signed in as {session.user.email}. Choosing a demo above will
          switch your session.
        </p>
      ) : null}
    </div>
  );
}
