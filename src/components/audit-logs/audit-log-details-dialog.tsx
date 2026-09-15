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
import { InfoGrid } from "@/components/shared/info-grid";
import { formatDateTime } from "@/lib/utils";
import type { AuditLogListItem } from "@/lib/data/audit-logs";

function formatMetadataValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value);
}

function formatMetadataKey(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

export function AuditLogDetailsDialog({ log }: { log: AuditLogListItem }) {
  const metadataEntries = log.metadata ? Object.entries(log.metadata) : [];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Info className="size-4" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{formatMetadataKey(log.action)}</DialogTitle>
          <DialogDescription>
            {log.entityType} · {log.entityId}
          </DialogDescription>
        </DialogHeader>

        <InfoGrid
          items={[
            { label: "Date / Time", value: formatDateTime(log.createdAt) },
            {
              label: "Actor",
              value: log.actorName
                ? `${log.actorName} (${log.actorEmail ?? "—"})`
                : "System",
            },
            { label: "Action", value: log.action },
            { label: "Entity Type", value: log.entityType },
          ]}
        />

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            Entity ID
          </p>
          <p className="break-all rounded-md bg-muted px-2.5 py-1.5 font-mono text-xs">
            {log.entityId}
          </p>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            Metadata
          </p>
          {metadataEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No additional details recorded.
            </p>
          ) : (
            <dl className="space-y-2 rounded-md border border-border bg-muted/40 p-3">
              {metadataEntries.map(([key, value]) => (
                <div key={key} className="text-sm">
                  <dt className="text-xs font-medium text-muted-foreground">
                    {formatMetadataKey(key)}
                  </dt>
                  <dd className="break-all">{formatMetadataValue(value)}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
