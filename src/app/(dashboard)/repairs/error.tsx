"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { GlassCard } from "@/components/design-system/glass-card";
import { Button } from "@/components/ui/button";

export default function RepairsError({
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
    <GlassCard className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="glow-icon-chip flex size-12 items-center justify-center rounded-xl text-destructive">
        <AlertTriangle className="size-6" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold">Couldn&apos;t load maintenance data</p>
        <p className="text-sm text-muted-foreground">
          Something went wrong while fetching repair records.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={() => reset()}>
        <RefreshCw className="size-4" />
        Try again
      </Button>
    </GlassCard>
  );
}
