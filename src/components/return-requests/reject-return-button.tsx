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
  rejectReturnRequest,
  type ReturnRequestActionState,
} from "@/lib/actions/return-request-actions";

const initialState: ReturnRequestActionState = { error: null };

export function RejectReturnButton({ requestId }: { requestId: string }) {
  const rejectThis = rejectReturnRequest.bind(null, requestId);
  const [state, formAction, isPending] = useActionState(rejectThis, initialState);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline">
          <XCircle className="size-4" />
          Reject
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject this return request?</AlertDialogTitle>
          <AlertDialogDescription>
            The asset will remain assigned to the employee and they will keep custody.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {state.error ? (
          <p className="text-sm text-destructive">{state.error}</p>
        ) : null}

        <form action={formAction}>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <AlertDialogAction type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              Reject request
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
