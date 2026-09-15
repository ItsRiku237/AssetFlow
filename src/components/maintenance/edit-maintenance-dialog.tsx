"use client";

import { useActionState } from "react";
import { Loader2, Pencil } from "lucide-react";

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
  updateMaintenanceRecord,
  type MaintenanceActionState,
} from "@/lib/actions/maintenance-actions";

const initialState: MaintenanceActionState = { error: null };

export function EditMaintenanceDialog({
  recordId,
  issue,
  description,
  vendor,
  cost,
}: {
  recordId: string;
  issue: string;
  description: string | null;
  vendor: string | null;
  cost: string | null;
}) {
  const updateThisRecord = updateMaintenanceRecord.bind(null, recordId);
  const [state, formAction, isPending] = useActionState(
    updateThisRecord,
    initialState
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="size-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update maintenance record</DialogTitle>
          <DialogDescription>
            Only active (not yet completed) records can be edited.
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
              defaultValue={issue}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              defaultValue={description ?? ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="vendor" className="text-sm font-medium">
                Vendor
              </label>
              <Input id="vendor" name="vendor" defaultValue={vendor ?? ""} />
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
                defaultValue={cost ?? ""}
              />
            </div>
          </div>

          {state.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
