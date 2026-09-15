"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  approveReturnRequest,
  type ReturnRequestActionState,
} from "@/lib/actions/return-request-actions";

const initialState: ReturnRequestActionState = { error: null };

export function ApproveReturnButton({ requestId }: { requestId: string }) {
  const approveThis = approveReturnRequest.bind(null, requestId);
  const [state, formAction, isPending] = useActionState(approveThis, initialState);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="default">
          <CheckCircle2 className="size-4" />
          Approve
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Approve return request</AlertDialogTitle>
          <AlertDialogDescription>
            Choose the asset&apos;s next status after the return is accepted.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form action={formAction} className="space-y-4">
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Next asset status</legend>
            <label className="flex cursor-pointer items-start gap-2.5 rounded-md border border-border p-3 hover:bg-muted/40">
              <input
                type="radio"
                name="nextStatus"
                value="AVAILABLE"
                defaultChecked
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium">Available</p>
                <p className="text-xs text-muted-foreground">
                  Asset is returned and ready for re-assignment.                </p>
              </div>
            </label>
            <label className="flex cursor-pointer items-start gap-2.5 rounded-md border border-border p-3 hover:bg-muted/40">
              <input
                type="radio"
                name="nextStatus"
                value="IN_REPAIR"
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium">In Repair</p>
                <p className="text-xs text-muted-foreground">
                  Asset needs servicing before it can be reassigned.
                </p>
              </div>
            </label>
          </fieldset>

          {state.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              Confirm approval
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
