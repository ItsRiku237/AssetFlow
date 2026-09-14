"use client";

import { useActionState } from "react";
import { Loader2, UserPlus } from "lucide-react";

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
import { assignAsset, type AssignAssetState } from "@/lib/actions/assignment-actions";

export interface AssignableEmployee {
  id: string;
  name: string;
  department: string;
}

const initialState: AssignAssetState = { error: null };

export function AssignAssetDialog({
  assetId,
  employees,
}: {
  assetId: string;
  employees: AssignableEmployee[];
}) {
  const assignThisAsset = assignAsset.bind(null, assetId);
  const [state, formAction, isPending] = useActionState(
    assignThisAsset,
    initialState
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <UserPlus className="size-4" />
          Assign asset
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign this asset</DialogTitle>
          <DialogDescription>
            Choose the employee who will take custody of this asset.
          </DialogDescription>
        </DialogHeader>

        {employees.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            There are no employees to assign this asset to yet.
          </p>
        ) : (
          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="employeeId" className="text-sm font-medium">
                Employee
              </label>
              <select
                id="employeeId"
                name="employeeId"
                required
                defaultValue=""
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                <option value="" disabled>
                  Select an employee...
                </option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} — {employee.department}
                  </option>
                ))}
              </select>
            </div>

            {state.error ? (
              <p className="text-sm text-destructive">{state.error}</p>
            ) : null}

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="animate-spin" /> : null}
                Confirm assignment
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
