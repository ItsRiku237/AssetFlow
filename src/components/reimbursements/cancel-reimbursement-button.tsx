"use client";

import { useActionState } from "react";
import { Loader2, XCircle } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  cancelReimbursement,
  type ReimbursementActionState,
} from "@/lib/actions/reimbursement-actions";

const initialState: ReimbursementActionState = { error: null };

export function CancelReimbursementButton({
  reimbursementId,
}: {
  reimbursementId: string;
}) {
  const cancelThis = cancelReimbursement.bind(null, reimbursementId);
  const [state, formAction, isPending] = useActionState(cancelThis, initialState);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <XCircle className="size-4" />
          Cancel
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel reimbursement request?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently cancel your request. It cannot be approved
            or rejected after cancellation.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {state.error ? (
          <p className="text-sm text-destructive">{state.error}</p>
        ) : null}
        <form action={formAction}>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Keep request</AlertDialogCancel>
            <AlertDialogAction type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Cancel request
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
