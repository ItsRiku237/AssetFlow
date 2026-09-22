"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LogIn, Loader2, Mail, Lock, Sparkles } from "lucide-react";

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
    <div className="mx-auto w-full max-w-sm animate-af-fade-up">
      {/* ── Glass card ─────────────────────────────────────────── */}
      <div className="glass-panel rounded-2xl p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Use your company credentials to continue.
          </p>
        </div>

        {/* Credentials form */}
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                required
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
                className="pl-9"
              />
            </div>
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
              <LogIn className="size-4" />
            )}
            Sign in
          </Button>
        </form>

        {/* Divider */}
        <div className="my-4 flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">OR</span>
          <Separator className="flex-1" />
        </div>

        {/* Google */}
        <form action={signInWithGoogleTo}>
          <Button
            type="submit"
            variant="outline"
            className="w-full gap-2 transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            {/* Inline Google "G" logo — no external image needed */}
            <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
        </form>

        {/* Employee activation link */}
        <div className="mt-4 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5">
          <p className="text-xs text-muted-foreground">
            New employee?{" "}
            <Link
              href="/register"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              Activate your account
            </Link>
          </p>
        </div>
      </div>

      {/* ── Demo mode — prominent CTA ──────────────────────────── */}
      <div className="mt-4 animate-af-fade-up [animation-delay:120ms]">
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-px shadow-[0_0_24px_-8px_var(--glow-cyan)] transition-shadow hover:shadow-[0_0_32px_-6px_var(--glow-cyan)]">
          {/* Shimmer border line */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              background:
                "linear-gradient(90deg, transparent, color-mix(in oklab, var(--glow-cyan) 30%, transparent), transparent) border-box",
            }}
          />
          <div className="relative rounded-[15px] bg-background/60 px-5 py-4 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="glow-icon-chip mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-primary">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Explore the live demo
                  </p>
                  <p className="text-xs text-muted-foreground">
                    No account needed — experience AssetFlow instantly.
                  </p>
                </div>
              </div>
              <Link
                href="/demo"
                className="shrink-0 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
              >
                Try Demo →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
