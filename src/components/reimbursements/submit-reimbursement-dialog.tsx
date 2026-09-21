"use client";

import { useActionState, useState } from "react";
import { Loader2, PlusCircle } from "lucide-react";

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
  createReimbursement,
  type ReimbursementActionState,
} from "@/lib/actions/reimbursement-actions";

const initialState: ReimbursementActionState = { error: null };

interface SubmitReimbursementDialogProps {
  assets: { id: string; name: string; assetTag: string; type: string }[];
  maintenanceRecords: {
    id: string;
    assetId: string;
    issue: string;
    startedAt: string;
    completedAt: string | null;
  }[];
}

export function SubmitReimbursementDialog({
  assets,
  maintenanceRecords,
}: SubmitReimbursementDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [state, formAction, isPending] = useActionState(
    createReimbursement,
    initialState
  );

  const filteredRecords = maintenanceRecords.filter(
    (r) => r.assetId === selectedAssetId
  );

  return (
    <Dialog open={open} onOpenChange={(v) => {
      setOpen(v);
      if (!v) setSelectedAssetId("");
    }}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle className="size-4" />
          Submit request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Submit reimbursement request</DialogTitle>
          <DialogDescription>
            Record an out-of-pocket repair expense for reimbursement review.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {/* Asset */}
          <div className="space-y-1.5">
            <label htmlFor="assetId" className="text-sm font-medium">
              Asset <span className="text-destructive">*</span>
            </label>
            <select
              id="assetId"
              name="assetId"
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
            >
              <option value="">Select an asset…</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.assetTag})
                </option>
              ))}
            </select>
          </div>

          {/* Maintenance record (optional) */}
          <div className="space-y-1.5">
            <label htmlFor="maintenanceRecordId" className="text-sm font-medium">
              Related repair record{" "}
              <span className="text-xs font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <select
              id="maintenanceRecordId"
              name="maintenanceRecordId"
              disabled={!selectedAssetId || filteredRecords.length === 0}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">
                {selectedAssetId && filteredRecords.length === 0
                  ? "No repair records for this asset"
                  : "None / not linked to a record"}
              </option>
              {filteredRecords.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.issue}{" "}
                  {r.completedAt !== null ? "(completed)" : "(in progress)"}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label htmlFor="amount" className="text-sm font-medium">
              Amount <span className="text-destructive">*</span>
            </label>
            <Input
              id="amount"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              max="100000"
              required
              placeholder="0.00"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-destructive">*</span>
            </label>
            <Textarea
              id="description"
              name="description"
              required
              placeholder="Describe the expense and why reimbursement is needed…"
              rows={3}
            />
          </div>

          {/* Receipt reference */}
          <div className="space-y-1.5">
            <label htmlFor="receiptReference" className="text-sm font-medium">
              Receipt / reference{" "}
              <span className="text-xs font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <Input
              id="receiptReference"
              name="receiptReference"
              placeholder="Receipt #, invoice ID, or vendor reference"
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
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Submit request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
