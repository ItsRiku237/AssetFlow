"use client";

import { useActionState } from "react";
import { Loader2, PackagePlus } from "lucide-react";

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
  createAssetRequest,
  type AssetRequestActionState,
} from "@/lib/actions/asset-request-actions";

const initialState: AssetRequestActionState = { error: null };

export function RequestAssetDialog({ assetId }: { assetId: string }) {
  const requestThisAsset = createAssetRequest.bind(null, assetId);
  const [state, formAction, isPending] = useActionState(
    requestThisAsset,
    initialState
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PackagePlus className="size-4" />
          Request Asset
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request this asset</DialogTitle>
          <DialogDescription>
            Submit a request to be assigned this asset. An admin will review
            and approve or reject your request.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="reason" className="text-sm font-medium">
              Reason{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <Textarea
              id="reason"
              name="reason"
              placeholder="e.g. Needed for new project starting next week…"
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
