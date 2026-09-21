"use client";

import { useActionState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";

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
  approveReimbursement,
  type ReimbursementActionState,
} from "@/lib/actions/reimbursement-actions";

const initialState: ReimbursementActionState = { error: null };

export function ApproveReimbursementButton({
  reimbursementId,
}: {
  reimbursementId: string;
}) {
  const approveThis = approveReimbursement.bind(null, reimbursementId);
  const [state, formAction, isPending] = useActionState(approveThis, initialState);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CheckCircle className="size-4" />
          Approve
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Approve reimbursement?</AlertDialogTitle>
          <AlertDialogDescription>
            This confirms the expense is approved for reimbursement. No payment
            is processed here — this is a record approval only.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {state.error ? (
          <p className="text-sm text-destructive">{state.error}</p>
        ) : null}
        <form action={formAction}>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <AlertDialogAction type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Approve request
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
