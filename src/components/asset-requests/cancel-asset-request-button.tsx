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
  cancelAssetRequest,
  type AssetRequestActionState,
} from "@/lib/actions/asset-request-actions";

const initialState: AssetRequestActionState = { error: null };

export function CancelAssetRequestButton({
  requestId,
}: {
  requestId: string;
}) {
  const cancelThis = cancelAssetRequest.bind(null, requestId);
  const [state, formAction, isPending] = useActionState(cancelThis, initialState);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline">
          <XCircle className="size-4" />
          Cancel request
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this request?</AlertDialogTitle>
          <AlertDialogDescription>
            Your asset request will be cancelled. You can submit a new request
            for the same asset later.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {state.error ? (
          <p className="text-sm text-destructive">{state.error}</p>
        ) : null}

        <form action={formAction}>
          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={isPending}>
              Keep request
            </AlertDialogCancel>
            <AlertDialogAction type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="animate-spin size-4" />
              ) : null}
              Yes, cancel it
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
