"use client";

import { useActionState, useState, useTransition } from "react";
import { Loader2, Trash2, UserCheck, UserX } from "lucide-react";

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
  deactivateAdmin,
  reactivateAdmin,
  deleteAdmin,
  type AdminActionState,
} from "@/lib/actions/admin-actions";

const initialState: AdminActionState = { error: null };

export function DeactivateAdminButton({ adminId }: { adminId: string }) {
  const deactivateThis = deactivateAdmin.bind(null, adminId);
  const [state, formAction, isPending] = useActionState(deactivateThis, initialState);

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
          <AlertDialogTitle>Deactivate this admin?</AlertDialogTitle>
          <AlertDialogDescription>
            This admin will immediately lose access to the dashboard. All records
            and audit history are preserved. You can reactivate them at any time.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {state.error ? (
          <p className="text-sm text-destructive">{state.error}</p>
        ) : null}

        <form action={formAction}>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <AlertDialogAction type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Deactivate admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ReactivateAdminButton({ adminId }: { adminId: string }) {
  const reactivateThis = reactivateAdmin.bind(null, adminId);
  const [state, formAction, isPending] = useActionState(reactivateThis, initialState);

  return (
    <form action={formAction} className="inline-flex flex-col items-start gap-1">
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <UserCheck className="size-4" />
        )}
        Reactivate
      </Button>
    </form>
  );
}

export function DeleteAdminButton({ adminId, adminName }: { adminId: string; adminName: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await deleteAdmin(adminId);
      if (!result.ok) {
        setError(result.message);
      }
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
          <Trash2 className="size-4" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Permanently delete this admin?</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{adminName}</strong>&apos;s account will be permanently removed.
            Their audit history entries will be anonymised but not deleted.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Delete permanently
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
