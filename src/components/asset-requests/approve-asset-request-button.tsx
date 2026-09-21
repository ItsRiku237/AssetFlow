"use client";

import { useActionState, useState } from "react";
import { Loader2, Check } from "lucide-react";

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
  approveAssetRequest,
  type AssetRequestActionState,
} from "@/lib/actions/asset-request-actions";

const initialState: AssetRequestActionState = { error: null };

export function ApproveAssetRequestButton({
  requestId,
}: {
  requestId: string;
}) {
  const [open, setOpen] = useState(false);
  const approveThis = approveAssetRequest.bind(null, requestId);
  const [state, formAction, isPending] = useActionState(approveThis, initialState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Check className="size-4" />
          Approve
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve request</DialogTitle>
          <DialogDescription>
            This will assign the asset to the employee immediately.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor={`approve-note-${requestId}`} className="text-sm font-medium">
              Note{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              id={`approve-note-${requestId}`}
              name="reviewNote"
              placeholder="e.g. Approved for Q3 project…"
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
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin size-4" /> : null}
              Confirm approval
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
