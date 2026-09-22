"use client";

import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/utils";
import type { AuditLogListItem } from "@/lib/data/audit-logs";

function formatMetadataValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function formatKey(key: string) {
  return key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
}

function formatActionLabel(action: string) {
  return action
    .toLowerCase()
    .split("_")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

export function AuditLogDetailsDialog({ log }: { log: AuditLogListItem }) {
  const metadataEntries = log.metadata ? Object.entries(log.metadata) : [];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <Info className="size-3.5" />
          <span className="hidden sm:inline">Details</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-panel border-none sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">{formatActionLabel(log.action)}</DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {log.entityType} · {log.entityId}
          </DialogDescription>
        </DialogHeader>

        {/* Core fields */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/60 bg-muted/30 p-3 text-sm">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Date / Time</p>
              <p className="mt-0.5 font-medium">{formatDateTime(log.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Actor</p>
              <p className="mt-0.5 font-medium">
                {log.actorName ?? "System"}
              </p>
              {log.actorEmail ? (
                <p className="text-xs text-muted-foreground">{log.actorEmail}</p>
              ) : null}
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Action</p>
              <p className="mt-0.5 font-mono text-xs">{log.action}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Entity Type</p>
              <p className="mt-0.5 font-medium">{log.entityType}</p>
            </div>
          </div>

          {/* Entity ID */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Entity ID</p>
            <p className="break-all rounded-lg border border-border/60 bg-muted/40 px-3 py-1.5 font-mono text-xs">
              {log.entityId}
            </p>
          </div>

          {/* Metadata */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Metadata</p>
            {metadataEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No additional details recorded.
              </p>
            ) : (
              <dl className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-2.5">
                {metadataEntries.map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-xs font-medium text-muted-foreground">
                      {formatKey(key)}
                    </dt>
                    <dd className="mt-0.5 break-all text-sm">
                      {formatMetadataValue(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
