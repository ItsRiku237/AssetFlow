"use client";

import { useActionState, useState } from "react";
import { Loader2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  rejectReimbursement,
  type ReimbursementActionState,
} from "@/lib/actions/reimbursement-actions";

const initialState: ReimbursementActionState = { error: null };

export function RejectReimbursementDialog({
  reimbursementId,
}: {
  reimbursementId: string;
}) {
  const [open, setOpen] = useState(false);
  const rejectThis = rejectReimbursement.bind(null, reimbursementId);
  const [state, formAction, isPending] = useActionState(rejectThis, initialState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
          <XCircle className="size-4" />
          Reject
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject reimbursement request</DialogTitle>
          <DialogDescription>
            Provide a clear reason for rejecting this request. The employee will
            be notified with this message.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="rejectionReason" className="text-sm font-medium">
              Rejection reason
            </label>
            <Textarea
              id="rejectionReason"
              name="rejectionReason"
              required
              placeholder="e.g. Receipt not provided, expense not pre-approved…"
              rows={3}
            />
          </div>

          {state.error ? (
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
            <Button
              type="submit"
              variant="destructive"
              disabled={isPending}
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Reject request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
