"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Mail,
  ShieldCheck,
  UserPlus,
  KeyRound,
  Hash,
} from "lucide-react";
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

// ── Shared input wrapper ──────────────────────────────────────────────────────
function Field({
  icon: Icon,
  label,
  id,
  name,
  type = "text",
  placeholder,
  required,
  autoFocus,
  defaultValue,
  hint,
  className,
}: {
  icon?: React.ElementType;
  label: string;
  id: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoFocus?: boolean;
  defaultValue?: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        {Icon ? (
          <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        ) : null}
        <Input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          autoFocus={autoFocus}
          defaultValue={defaultValue}
          className={Icon ? "pl-9" : undefined}
        />
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

// ── Step indicator ────────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: "Verify identity" },
    { n: 2, label: "Confirm code" },
    { n: 3, label: "Set password" },
  ] as const;

  return (
    <div className="flex items-center gap-1.5">
      {steps.map(({ n, label }, i) => {
        const done = current > n;
        const active = current === n;
        return (
          <div key={n} className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5">
              <div
                className={[
                  "flex size-6 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  done
                    ? "bg-primary text-primary-foreground"
                    : active
                    ? "border border-primary/50 bg-primary/10 text-primary"
                    : "border border-border bg-muted text-muted-foreground",
                ].join(" ")}
              >
                {done ? <CheckCircle2 className="size-3.5" /> : n}
              </div>
              <span
                className={[
                  "hidden text-xs sm:inline",
                  active ? "font-medium text-foreground" : "text-muted-foreground",
                ].join(" ")}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 ? (
              <div
                className={[
                  "h-px w-6 transition-colors",
                  current > n ? "bg-primary" : "bg-border",
                ].join(" ")}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

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
      <Field
        icon={Hash}
        label="Employee ID"
        id="employeeCode"
        name="employeeCode"
        placeholder="e.g. EMP-0001"
        required
        autoFocus
        defaultValue={state.employeeCode}
      />
      <Field
        icon={Mail}
        label="Company Email"
        id="email"
        name="email"
        type="email"
        placeholder="you@company.com"
        required
        hint="Must match the email in the employee directory."
      />
      {state.error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      ) : null}
      <Button type="submit" className="w-full gap-2" disabled={pending}>
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Mail className="size-4" />
        )}
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
      <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm">
        A 6-digit code was sent to{" "}
        <span className="font-medium text-foreground">
          {state.maskedEmail ?? "your company email"}
        </span>
        . It expires in 10 minutes.
      </div>

      <form action={verifyAction} className="space-y-4">
        <input type="hidden" name="employeeCode" value={state.employeeCode ?? ""} />
        <div className="space-y-1.5">
          <label htmlFor="code" className="text-sm font-medium">
            Verification code
          </label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="code"
              name="code"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              required
              autoFocus
              className="pl-9 text-center tracking-[0.45em] text-lg font-mono"
            />
          </div>
        </div>
        {state.error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </div>
        ) : null}
        <Button type="submit" className="w-full gap-2" disabled={pending}>
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ShieldCheck className="size-4" />
          )}
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
        {fe.name ? (
          <p className="text-xs text-destructive">{fe.name}</p>
        ) : null}
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
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
        />
        {fe.confirmPassword ? (
          <p className="text-xs text-destructive">{fe.confirmPassword}</p>
        ) : null}
      </div>
      {state.error && !Object.keys(fe).length ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      ) : null}
      <Button type="submit" className="w-full gap-2" disabled={pending}>
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <UserPlus className="size-4" />
        )}
        Create account
      </Button>
    </form>
  );
}

// ─── Step 4 ────────────────────────────────────────────────────────────────
function Step4() {
  return (
    <div className="space-y-5 py-2 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-success/30 bg-success/10">
        <CheckCircle2 className="size-7 text-success" />
      </div>
      <div className="space-y-1">
        <p className="text-lg font-semibold">Account ready!</p>
        <p className="text-sm text-muted-foreground">
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

  const states = [s3State, s2rState, s2State, s1State];
  const current = states.reduce(
    (best, s) => (s.step >= best.step ? s : best),
    INITIAL
  );

  const pending = s1Pending || s2Pending || s2rPending || s3Pending;

  return (
    <div className="space-y-6">
      {current.step < 4 ? (
        <StepIndicator current={current.step as 1 | 2 | 3} />
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

      {current.step === 1 ? (
        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
          >
            Sign in
          </Link>
        </p>
      ) : null}
    </div>
  );
}
