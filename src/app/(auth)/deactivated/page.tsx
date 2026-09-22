import { ShieldOff } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * Shown to any admin whose account has been deactivated by a super-admin.
 */
export default function DeactivatedPage() {
  return (
    <div className="mx-auto w-full max-w-sm animate-af-fade-up">
      <div className="glass-panel rounded-2xl p-8 shadow-xl">
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <div className="glow-icon-chip flex size-14 items-center justify-center rounded-full text-destructive">
              <ShieldOff className="size-7" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-semibold tracking-tight">Account Deactivated</h1>
            <p className="text-sm text-muted-foreground">
              Your administrator account has been deactivated. You cannot access
              the dashboard until a super-admin reactivates your account.
            </p>
            <p className="text-sm text-muted-foreground">
              If you believe this is a mistake, please contact your system
              administrator.
            </p>
          </div>

          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Sign in with a different account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
