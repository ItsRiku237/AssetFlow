"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AssetsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-destructive/40 py-16 text-center">
      <AlertTriangle className="size-8 text-destructive" />
      <div className="space-y-1">
        <p className="text-sm font-medium">Couldn&apos;t load assets</p>
        <p className="text-sm text-muted-foreground">
          Something went wrong while fetching asset data.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
