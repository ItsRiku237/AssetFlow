"use client";

import { useActionState, useState } from "react";
import { Loader2, X } from "lucide-react";

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
  rejectAssetRequest,
  type AssetRequestActionState,
} from "@/lib/actions/asset-request-actions";

const initialState: AssetRequestActionState = { error: null };

export function RejectAssetRequestButton({
  requestId,
}: {
  requestId: string;
}) {
  const [open, setOpen] = useState(false);
  const rejectThis = rejectAssetRequest.bind(null, requestId);
  const [state, formAction, isPending] = useActionState(rejectThis, initialState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <X className="size-4" />
          Reject
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject request</DialogTitle>
          <DialogDescription>
            The employee will be notified that their request was not approved.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor={`reject-note-${requestId}`} className="text-sm font-medium">
              Reason{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              id={`reject-note-${requestId}`}
              name="reviewNote"
              placeholder="e.g. Budget not approved for this quarter…"
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
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin size-4" /> : null}
              Confirm rejection
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
