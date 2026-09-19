"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CheckCircle2, Loader2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerEmployee } from "@/lib/actions/register-actions";
import { registerInitialState } from "@/lib/validations/register";

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  required?: boolean;
  defaultValue?: string;
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
  error,
  required,
  defaultValue,
}: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
        {required ? " *" : ""}
      </label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        defaultValue={defaultValue}
        aria-describedby={error ? `${name}-error` : undefined}
        aria-invalid={!!error}
      />
      {error ? (
        <p id={`${name}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    registerEmployee,
    registerInitialState
  );

  if (state.success) {
    return (
      <div className="w-full max-w-sm space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2 className="size-10 text-success" />
          <div className="space-y-1">
            <p className="font-semibold">Account activated!</p>
            <p className="text-sm text-muted-foreground">
              Your employee account has been created and linked. You can now
              sign in with your email and password.
            </p>
          </div>
          <Button asChild className="mt-2 w-full">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  const fe = state.fieldErrors ?? {};

  return (
    <div className="w-full max-w-sm space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="space-y-1">
        <h1 className="text-base font-semibold">Activate your account</h1>
        <p className="text-sm text-muted-foreground">
          Enter the Employee ID your company assigned to you, then create your
          login credentials.
        </p>
      </div>

      {state.error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <form action={formAction} className="space-y-3">
        <Field
          label="Employee ID"
          name="employeeCode"
          placeholder="e.g. EMP-1024"
          autoComplete="off"
          error={fe.employeeCode}
          required
        />

        <div className="border-t border-border pt-3">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Account credentials
          </p>
          <div className="space-y-3">
            <Field
              label="Full name"
              name="name"
              placeholder="As it appears on company records"
              autoComplete="name"
              error={fe.name}
              required
            />
            <Field
              label="Email"
              name="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              error={fe.email}
              required
            />
            <Field
              label="Password"
              name="password"
              type="password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              error={fe.password}
              required
            />
            <Field
              label="Confirm password"
              name="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              autoComplete="new-password"
              error={fe.confirmPassword}
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <UserPlus className="size-4" />
          )}
          Create account
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="underline underline-offset-4">
          Sign in
        </Link>
      </p>

      <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
        <strong>Note:</strong> If your Employee ID doesn&apos;t work, contact
        your administrator to ensure your record has been created and is set to
        Active.
      </p>
    </div>
  );
}
