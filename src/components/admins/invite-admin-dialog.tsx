"use client";

import { useActionState, useState } from "react";
import { Loader2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { inviteAdmin, type InviteAdminActionState } from "@/lib/actions/admin-actions";

const initialState: InviteAdminActionState = { error: null };

export function InviteAdminDialog({ demoMode = false }: { demoMode?: boolean }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(inviteAdmin, initialState);

  return (
    <Dialog open={open && !state.success} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="size-4" />
          Invite Admin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Administrator</DialogTitle>
          <DialogDescription>
            {demoMode
              ? "Demo mode: this creates a demo-only admin account. No invitation email is sent and the account cannot sign in. Use an address like demo-jane@assetflow.dev."
              : "Create an admin account and send a temporary password to their email. They can sign in immediately and should change their password after first login."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="invite-name" className="text-sm font-medium">
              Full Name
            </label>
            <Input
              id="invite-name"
              name="name"
              type="text"
              placeholder="Jane Smith"
              autoComplete="off"
              required
            />
            {state.fieldErrors?.name ? (
              <p className="text-xs text-destructive">{state.fieldErrors.name}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="invite-email" className="text-sm font-medium">
              Email Address
            </label>
            <Input
              id="invite-email"
              name="email"
              type="email"
              placeholder={demoMode ? "demo-jane@assetflow.dev" : "jane@company.com"}
              autoComplete="off"
              required
            />
            {state.fieldErrors?.email ? (
              <p className="text-xs text-destructive">{state.fieldErrors.email}</p>
            ) : null}
          </div>

          {state.error && !state.fieldErrors ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {demoMode ? "Create Demo Admin" : "Send Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
