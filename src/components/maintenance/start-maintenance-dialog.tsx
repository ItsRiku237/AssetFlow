"use client";

import { useActionState } from "react";
import { Loader2, Wrench } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createMaintenanceRecord,
  type MaintenanceActionState,
} from "@/lib/actions/maintenance-actions";

const initialState: MaintenanceActionState = { error: null };

export function StartMaintenanceDialog({ assetId }: { assetId: string }) {
  const createForThisAsset = createMaintenanceRecord.bind(null, assetId);
  const [state, formAction, isPending] = useActionState(
    createForThisAsset,
    initialState
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Wrench className="size-4" />
          Log repair
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log maintenance record</DialogTitle>
          <DialogDescription>
            Record what&apos;s wrong with this asset before service begins.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="issue" className="text-sm font-medium">
              Issue
            </label>
            <Input
              id="issue"
              name="issue"
              required
              placeholder="e.g. Won't power on"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              placeholder="Additional detail (optional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="vendor" className="text-sm font-medium">
                Vendor
              </label>
              <Input
                id="vendor"
                name="vendor"
                placeholder="Service center (optional)"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="cost" className="text-sm font-medium">
                Estimated cost
              </label>
              <Input
                id="cost"
                name="cost"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>

          {state.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              Start repair record
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
