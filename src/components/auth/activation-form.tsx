"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, Mail, ShieldCheck, UserPlus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  verifyAndSendOtp,
  verifyOtpCode,
  resendOtp,
  createAccount,
} from "@/lib/actions/activation-actions";
import type { ActivationActionState } from "@/lib/validations/activation";

const INITIAL: ActivationActionState = { step: 1, error: null };

// ─── Step 1 ────────────────────────────────────────────────────────────────
function Step1({
  state,
  action,
  pending,
}: {
  state: ActivationActionState;
  action: (fd: FormData) => void;
  pending: boolean;
}) {
  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="employeeCode" className="text-sm font-medium">
          Employee ID
        </label>
        <Input
          id="employeeCode"
          name="employeeCode"
          placeholder="e.g. EMP-0001"
          required
          autoFocus
          defaultValue={state.employeeCode}
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Company Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@company.com"
          required
        />
        <p className="text-xs text-muted-foreground">
          Must match the email in the employee directory.
        </p>
      </div>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <Mail className="size-4" />}
        Send verification code
      </Button>
    </form>
  );
}

// ─── Step 2 ────────────────────────────────────────────────────────────────
function Step2({
  state,
  verifyAction,
  resendAction,
  pending,
}: {
  state: ActivationActionState;
  verifyAction: (fd: FormData) => void;
  resendAction: (fd: FormData) => void;
  pending: boolean;
}) {
  const [cooldown, setCooldown] = useState(60);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, []);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        A 6-digit code was sent to{" "}
        <span className="font-medium text-foreground">
          {state.maskedEmail ?? "your company email"}
        </span>
        . It expires in 10 minutes.
      </p>

      <form action={verifyAction} className="space-y-4">
        <input type="hidden" name="employeeCode" value={state.employeeCode ?? ""} />
        <div className="space-y-1.5">
          <label htmlFor="code" className="text-sm font-medium">
            Verification code
          </label>
          <Input
            id="code"
            name="code"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            required
            autoFocus
            className="text-center tracking-[0.5em] text-lg"
          />
        </div>
        {state.error ? (
          <p className="text-sm text-destructive">{state.error}</p>
        ) : null}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <ShieldCheck className="size-4" />}
          Verify code
        </Button>
      </form>

      <form action={resendAction}>
        <input type="hidden" name="employeeCode" value={state.employeeCode ?? ""} />
        <input type="hidden" name="email" value={state.email ?? ""} />
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground"
          disabled={pending || cooldown > 0}
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </Button>
      </form>
    </div>
  );
}

// ─── Step 3 ────────────────────────────────────────────────────────────────
function Step3({
  state,
  action,
  pending,
}: {
  state: ActivationActionState;
  action: (fd: FormData) => void;
  pending: boolean;
}) {
  const fe = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="employeeCode" value={state.employeeCode ?? ""} />
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Full name
        </label>
        <Input id="name" name="name" placeholder="Jane Smith" required autoFocus />
        {fe.name ? <p className="text-xs text-destructive">{fe.name}</p> : null}
      </div>
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <Input id="password" name="password" type="password" required />
        {fe.password ? (
          <p className="text-xs text-destructive">{fe.password}</p>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm password
        </label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required />
        {fe.confirmPassword ? (
          <p className="text-xs text-destructive">{fe.confirmPassword}</p>
        ) : null}
      </div>
      {state.error && !Object.keys(fe).length ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <UserPlus className="size-4" />}
        Create account
      </Button>
    </form>
  );
}

// ─── Step 4 ────────────────────────────────────────────────────────────────
function Step4() {
  return (
    <div className="space-y-4 text-center">
      <CheckCircle2 className="mx-auto size-12 text-green-500" />
      <div>
        <p className="font-semibold text-lg">Account ready!</p>
        <p className="text-sm text-muted-foreground mt-1">
          Your AssetFlow account has been created. You can now sign in.
        </p>
      </div>
      <Button asChild className="w-full">
        <Link href="/login">Continue to sign in</Link>
      </Button>
    </div>
  );
}

// ─── Orchestrator ──────────────────────────────────────────────────────────
export function ActivationForm() {
  const [s1State, s1Action, s1Pending] = useActionState(verifyAndSendOtp, INITIAL);
  const [s2State, s2Action, s2Pending] = useActionState(verifyOtpCode, s1State);
  const [s2rState, s2rAction, s2rPending] = useActionState(resendOtp, s1State);
  const [s3State, s3Action, s3Pending] = useActionState(createAccount, s2State);

  // Determine the authoritative current state (last action that ran wins).
  // We pick the state with the highest step number that has been set.
  const states = [s3State, s2rState, s2State, s1State];
  const current = states.reduce(
    (best, s) => (s.step >= best.step ? s : best),
    INITIAL
  );

  const pending = s1Pending || s2Pending || s2rPending || s3Pending;

  const STEP_LABELS = ["Verify identity", "Enter code", "Create password", "Done"];

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      {current.step < 4 ? (
        <div className="flex items-center gap-2">
          {STEP_LABELS.slice(0, 3).map((label, i) => {
            const stepNum = (i + 1) as 1 | 2 | 3;
            const active = current.step === stepNum;
            const done = current.step > stepNum;
            return (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
                    done
                      ? "bg-primary text-primary-foreground"
                      : active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? "✓" : stepNum}
                </div>
                <span
                  className={`text-xs ${active ? "font-medium" : "text-muted-foreground"}`}
                >
                  {label}
                </span>
                {i < 2 && <div className="h-px w-4 bg-border" />}
              </div>
            );
          })}
        </div>
      ) : null}

      {current.step === 1 && (
        <Step1 state={current} action={s1Action} pending={pending} />
      )}
      {current.step === 2 && (
        <Step2
          state={current}
          verifyAction={s2Action}
          resendAction={s2rAction}
          pending={pending}
        />
      )}
      {current.step === 3 && (
        <Step3 state={current} action={s3Action} pending={pending} />
      )}
      {current.step === 4 && <Step4 />}
    </div>
  );
}
