"use client";

import { useActionState } from "react";
import { Crown, Loader2, ShieldCheck, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  signInAsDemoAdmin,
  signInAsDemoEmployee,
  signInAsDemoSuperAdmin,
  type DemoSignInState,
} from "@/lib/actions/demo-actions";

const initialState: DemoSignInState = { error: null };

function DemoOption({
  title,
  description,
  icon: Icon,
  action,
}: {
  title: string;
  description: string;
  icon: typeof ShieldCheck;
  action: () => Promise<DemoSignInState>;
}) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: DemoSignInState, _formData: FormData) => action(),
    initialState
  );

  return (
    <form
      action={formAction}
      className="flex flex-1 flex-col gap-3 rounded-lg border border-border bg-card p-5 text-left"
    >
      <div className="flex items-center gap-2">
        <Icon className="size-5 text-primary" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" disabled={isPending} className="mt-auto w-full">
        {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        Try {title}
      </Button>
    </form>
  );
}

export function DemoEntry() {
  return (
    <div className="flex w-full max-w-4xl flex-col gap-6 md:flex-row">
      <DemoOption
        title="Admin Demo"
        description="Manage assets, employees, assignments, return requests, repairs, reimbursements, and audit logs."
        icon={ShieldCheck}
        action={signInAsDemoAdmin}
      />
      <DemoOption
        title="Employee Demo"
        description="View assigned assets, request equipment, submit returns and reimbursements, and manage your profile."
        icon={UserRound}
        action={signInAsDemoEmployee}
      />
      <DemoOption
        title="Super Admin Demo"
        description="Everything an Admin can do, plus managing administrator accounts — invite, deactivate, reactivate, and remove demo admins. No real emails are sent."
        icon={Crown}
        action={signInAsDemoSuperAdmin}
      />
    </div>
  );
}
