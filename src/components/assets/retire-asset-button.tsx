"use client";

import { useActionState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

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
import { retireAsset, type AssetActionState } from "@/lib/actions/asset-actions";

const initialState: AssetActionState = { error: null };

export function RetireAssetButton({ assetId }: { assetId: string }) {
  const retireThisAsset = retireAsset.bind(null, assetId);
  const [state, formAction, isPending] = useActionState(
    retireThisAsset,
    initialState
  );

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <AlertTriangle className="size-4" />
          Retire
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Retire this asset?</AlertDialogTitle>
          <AlertDialogDescription>
            Retired assets can no longer be assigned to anyone. This does not
            delete its history.
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
              Retire asset
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
