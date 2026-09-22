"use client";

import {
  CheckCircle2,
  Clock,
  Shield,
  XCircle,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { AuditLogDetailsDialog } from "@/components/audit-logs/audit-log-details-dialog";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils";
import type { AuditLogListItem } from "@/lib/data/audit-logs";

// ── Action classification ────────────────────────────────────────────────────

type ActionTone = "success" | "destructive" | "warning" | "default" | "secondary";

function getActionTone(action: string): ActionTone {
  if (action.includes("REJECTED") || action.includes("RETIRED") || action.includes("DELETED") || action.includes("CANCELLED")) return "destructive";
  if (action.includes("CREATED") || action.includes("APPROVED") || action.includes("SUBMITTED") || action.includes("INVITED")) return "success";
  if (action.includes("UPDATED") || action.includes("STATUS_CHANGED") || action.includes("DEACTIVATED")) return "warning";
  if (action.includes("REACTIVATED")) return "default";
  return "secondary";
}

function getActionIcon(action: string) {
  const tone = getActionTone(action);
  if (tone === "success") return CheckCircle2;
  if (tone === "destructive") return XCircle;
  if (tone === "warning") return Zap;
  return Shield;
}

function formatActionLabel(action: string) {
  return action
    .toLowerCase()
    .split("_")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

// ── Entity type chip ─────────────────────────────────────────────────────────

const ENTITY_COLORS: Record<string, string> = {
  Asset: "text-primary border-primary/30 bg-primary/10",
  User: "text-[var(--glow-purple)] border-[var(--glow-purple)]/30 bg-[var(--glow-purple)]/10",
  Employee: "text-success border-success/30 bg-success/10",
  Reimbursement: "text-[var(--glow-cyan)] border-[var(--glow-cyan)]/30 bg-[var(--glow-cyan)]/10",
  MaintenanceRecord: "text-warning border-warning/30 bg-warning/10",
};

function EntityChip({ type }: { type: string }) {
  const cls = ENTITY_COLORS[type] ?? "text-muted-foreground border-border bg-muted/50";
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", cls)}>
      {type}
    </span>
  );
}

// ── Row expand detail ────────────────────────────────────────────────────────

function MetadataSummary({ metadata }: { metadata: AuditLogListItem["metadata"] }) {
  if (!metadata) return <span className="text-muted-foreground/50">—</span>;
  const entries = Object.entries(metadata).filter(([, v]) => v !== null && v !== undefined);
  if (entries.length === 0) return <span className="text-muted-foreground/50">—</span>;
  return (
    <span className="truncate text-xs text-muted-foreground">
      {entries
        .slice(0, 2)
        .map(([k, v]) => `${k}: ${String(v)}`)
        .join(" · ")}
      {entries.length > 2 ? " …" : ""}
    </span>
  );
}

// ── Main table ───────────────────────────────────────────────────────────────

export function AuditLogTable({ logs }: { logs: AuditLogListItem[] }) {
  return (
    <>
      {/* ── Desktop table ──────────────────────────────────────── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                Date / Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Actor
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Action
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Entity
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Details
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                &nbsp;
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => {
              const tone = getActionTone(log.action);
              const Icon = getActionIcon(log.action);
              return (
                <tr
                  key={log.id}
                  className={cn(
                    "group border-b border-border/30 transition-colors hover:bg-primary/5",
                    i % 2 === 1 && "bg-muted/20"
                  )}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3 shrink-0 text-muted-foreground/50" />
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(log.createdAt)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {log.actorName ? (
                      <div>
                        <p className="font-medium leading-snug">{log.actorName}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                          {log.actorEmail}
                        </p>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Shield className="size-3" />
                        System
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Icon
                        className={cn(
                          "size-3.5 shrink-0",
                          tone === "success" && "text-success",
                          tone === "destructive" && "text-destructive",
                          tone === "warning" && "text-warning",
                          (tone === "default" || tone === "secondary") && "text-muted-foreground"
                        )}
                      />
                      <Badge variant={tone} className="font-mono text-[10px] tracking-wide">
                        {formatActionLabel(log.action)}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <EntityChip type={log.entityType} />
                      <p
                        className="font-mono text-[10px] text-muted-foreground/60 max-w-[8rem] truncate"
                        title={log.entityId}
                      >
                        {log.entityId.slice(0, 12)}…
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <MetadataSummary metadata={log.metadata} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AuditLogDetailsDialog log={log} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Mobile card list ───────────────────────────────────── */}
      <div className="divide-y divide-border/40 md:hidden">
        {logs.map((log) => {
          const tone = getActionTone(log.action);
          const Icon = getActionIcon(log.action);
          return (
            <div key={log.id} className="px-4 py-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Icon
                    className={cn(
                      "size-3.5 shrink-0",
                      tone === "success" && "text-success",
                      tone === "destructive" && "text-destructive",
                      tone === "warning" && "text-warning",
                      (tone === "default" || tone === "secondary") && "text-muted-foreground"
                    )}
                  />
                  <Badge variant={tone} className="font-mono text-[10px]">
                    {formatActionLabel(log.action)}
                  </Badge>
                </div>
                <AuditLogDetailsDialog log={log} />
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {log.actorName ?? "System"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {log.actorEmail ?? ""}
                  </p>
                </div>
                <EntityChip type={log.entityType} />
              </div>
              <p className="text-xs text-muted-foreground/60">
                {formatDateTime(log.createdAt)}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
}
