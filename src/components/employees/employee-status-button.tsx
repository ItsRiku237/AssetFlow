"use client";

import { useActionState } from "react";
import { Loader2, UserCheck, UserX } from "lucide-react";

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
  deactivateEmployee,
  reactivateEmployee,
  type EmployeeActionState,
} from "@/lib/actions/employee-actions";

const initialState: EmployeeActionState = { error: null };

export function DeactivateEmployeeButton({ employeeId }: { employeeId: string }) {
  const deactivateThisEmployee = deactivateEmployee.bind(null, employeeId);
  const [state, formAction, isPending] = useActionState(
    deactivateThisEmployee,
    initialState
  );

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserX className="size-4" />
          Deactivate
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deactivate this employee?</AlertDialogTitle>
          <AlertDialogDescription>
            The directory record and all assignment, return, and repair
            history are kept. The employee is simply excluded from future
            asset assignments until reactivated.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {state.error ? (
          <p className="text-sm text-destructive">{state.error}</p>
        ) : null}

        <form action={formAction}>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <AlertDialogAction type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              Deactivate employee
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ReactivateEmployeeButton({ employeeId }: { employeeId: string }) {
  const reactivateThisEmployee = reactivateEmployee.bind(null, employeeId);
  const [state, formAction, isPending] = useActionState(
    reactivateThisEmployee,
    initialState
  );

  return (
    <form action={formAction} className="inline-flex flex-col items-start gap-1">
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : <UserCheck className="size-4" />}
        Reactivate
      </Button>
    </form>
  );
}
