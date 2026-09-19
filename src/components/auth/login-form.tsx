"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LogIn, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  authenticateWithCredentials,
  signInWithGoogle,
  type LoginActionState,
} from "@/lib/actions/auth-actions";

const initialState: LoginActionState = { error: null };

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const authenticate = authenticateWithCredentials.bind(null, callbackUrl);
  const signInWithGoogleTo = signInWithGoogle.bind(null, callbackUrl);
  const [state, formAction, isPending] = useActionState(
    authenticate,
    initialState
  );

  return (
    <div className="w-full max-w-sm space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="space-y-1">
        <h1 className="text-base font-semibold">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Use your company credentials to continue.
        </p>
      </div>

      <form action={formAction} className="space-y-3">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
          />
        </div>

        {state.error ? (
          <p className="text-sm text-destructive">{state.error}</p>
        ) : null}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <LogIn className="size-4" />
          )}
          Sign in
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">OR</span>
        <Separator className="flex-1" />
      </div>

      {/* Google sign-in: activates an employee account when the Google
          email exactly matches a provisioned, ACTIVE, unlinked Employee.
          Existing employees who linked via Google can also sign back in. */}
      <form action={signInWithGoogleTo}>
        <Button type="submit" variant="outline" className="w-full">
          Continue with Google
        </Button>
      </form>

      <div className="rounded-md border border-border bg-muted/50 px-3 py-2.5">
        <p className="text-xs text-muted-foreground">
          New employee?{" "}
          <Link
            href="/register"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Activate your account with Employee ID + email
          </Link>
        </p>
      </div>
    </div>
  );
}
