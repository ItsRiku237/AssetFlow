"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";

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
      // Force a full session refresh so the JWT/cookie picks up
      // onboardingRequired=false and role=EMPLOYEE, then navigate.
      router.refresh();
      router.push(redirectTo);
    }
  }, [state.success, redirectTo, router]);

  return (
    <div className="w-full max-w-sm space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="space-y-1">
        <h1 className="text-base font-semibold">Company Verification</h1>
        <p className="text-sm text-muted-foreground">
          Enter the Employee ID your company assigned to you to link your account
          and access the employee dashboard.
        </p>
      </div>

      {state.success ? (
        <div className="flex items-center gap-2 rounded-md bg-success/10 px-3 py-2 text-sm text-success">
          <ShieldCheck className="size-4 shrink-0" />
          <span>Verification successful! Redirecting…</span>
        </div>
      ) : (
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="employeeCode" className="text-sm font-medium">
              Employee ID
            </label>
            <Input
              id="employeeCode"
              name="employeeCode"
              placeholder="e.g. EMP-1024"
              autoComplete="off"
              required
            />
            <p className="text-xs text-muted-foreground">
              This is the company-assigned identifier given to you by your
              administrator.
            </p>
          </div>

          {state.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : null}
            Verify &amp; Access Dashboard
          </Button>
        </form>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Don&apos;t know your Employee ID? Contact your administrator.
      </p>
    </div>
  );
}
