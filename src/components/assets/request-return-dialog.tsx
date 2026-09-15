"use client";

import { useActionState } from "react";
import { Loader2, Undo2 } from "lucide-react";

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
  createReturnRequest,
  type ReturnRequestActionState,
} from "@/lib/actions/return-request-actions";

const initialState: ReturnRequestActionState = { error: null };

export function RequestReturnDialog({ assetId }: { assetId: string }) {
  const requestReturnForThisAsset = createReturnRequest.bind(null, assetId);
  const [state, formAction, isPending] = useActionState(
    requestReturnForThisAsset,
    initialState
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Undo2 className="size-4" />
          Request Return
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request return</DialogTitle>
          <DialogDescription>
            Let your admin know why you&apos;re returning this asset.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="reason" className="text-sm font-medium">
              Reason
            </label>
            <Textarea
              id="reason"
              name="reason"
              required
              placeholder="e.g. Replaced with new laptop, no longer needed..."
            />
          </div>

          {state.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              Submit request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
