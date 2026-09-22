"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, Hash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { completeOnboarding } from "@/lib/actions/onboarding-actions";
import { onboardingInitialState } from "@/lib/validations/onboarding";

export function OnboardingForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    completeOnboarding,
    onboardingInitialState
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
      router.push(redirectTo);
    }
  }, [state.success, redirectTo, router]);

  return (
    <div className="mx-auto w-full max-w-sm animate-af-fade-up">
      <div className="glass-panel rounded-2xl p-6 shadow-xl">
        <div className="mb-6 space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Company Verification</h1>
          <p className="text-sm text-muted-foreground">
            Enter the Employee ID your company assigned to you to link your
            Google account and access the dashboard.
          </p>
        </div>

        {state.success ? (
          <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2.5 text-sm text-success">
            <ShieldCheck className="size-4 shrink-0" />
            <span>Verification successful! Redirecting…</span>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="employeeCode" className="text-sm font-medium">
                Employee ID
              </label>
              <div className="relative">
                <Hash className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="employeeCode"
                  name="employeeCode"
                  placeholder="e.g. EMP-1024"
                  autoComplete="off"
                  required
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Company-assigned identifier given to you by your administrator.
              </p>
            </div>

            {state.error ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {state.error}
              </div>
            ) : null}

            <Button type="submit" className="w-full gap-2" disabled={isPending}>
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ShieldCheck className="size-4" />
              )}
              Verify &amp; Access Dashboard
            </Button>
          </form>
        )}

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Don&apos;t know your Employee ID?{" "}
          <span className="font-medium text-foreground">Contact your administrator.</span>
        </p>
      </div>
    </div>
  );
}
