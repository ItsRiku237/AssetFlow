"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

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
  completeMaintenanceRecord,
  type MaintenanceActionState,
} from "@/lib/actions/maintenance-actions";

const initialState: MaintenanceActionState = { error: null };

export function CompleteMaintenanceButton({ recordId }: { recordId: string }) {
  const completeThisRecord = completeMaintenanceRecord.bind(null, recordId);
  const [state, formAction, isPending] = useActionState(
    completeThisRecord,
    initialState
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="default">
          <CheckCircle2 className="size-4" />
          Complete repair
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete this repair</DialogTitle>
          <DialogDescription>
            The asset will become Available for reassignment.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="resolution" className="text-sm font-medium">
              Resolution
            </label>
            <Textarea
              id="resolution"
              name="resolution"
              required
              placeholder="What was done to fix it?"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="cost" className="text-sm font-medium">
              Final cost
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

          {state.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              Mark repaired
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
