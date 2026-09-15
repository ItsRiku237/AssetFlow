import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AuditLogDetailsDialog } from "@/components/audit-logs/audit-log-details-dialog";
import { formatDateTime } from "@/lib/utils";
import type { AuditLogListItem } from "@/lib/data/audit-logs";

function actionVariant(action: string): "default" | "secondary" | "success" | "warning" | "destructive" {
  if (action.includes("REJECTED")) return "destructive";
  if (action.includes("RETIRED")) return "secondary";
  if (action.includes("CREATED") || action.includes("APPROVED")) return "success";
  if (action.includes("UPDATED") || action.includes("STATUS_CHANGED")) return "warning";
  return "default";
}

function summarizeMetadata(metadata: AuditLogListItem["metadata"]): string {
  if (!metadata) return "—";
  const entries = Object.entries(metadata);
  if (entries.length === 0) return "—";
  return entries
    .slice(0, 2)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(" · ");
}

export function AuditLogTable({ logs }: { logs: AuditLogListItem[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Date / Time</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Entity Type</TableHead>
            <TableHead>Entity ID</TableHead>
            <TableHead>Details</TableHead>
            <TableHead className="text-right">&nbsp;</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {formatDateTime(log.createdAt)}
              </TableCell>
              <TableCell>
                {log.actorName ? (
                  <>
                    <div className="font-medium">{log.actorName}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {log.actorEmail}
                    </div>
                  </>
                ) : (
                  <span className="text-muted-foreground">System</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={actionVariant(log.action)}>{log.action}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {log.entityType}
              </TableCell>
              <TableCell>
                <span
                  className="block max-w-[10rem] truncate font-mono text-xs text-muted-foreground"
                  title={log.entityId}
                >
                  {log.entityId}
                </span>
              </TableCell>
              <TableCell className="max-w-[16rem]">
                <span className="block truncate text-xs text-muted-foreground">
                  {summarizeMetadata(log.metadata)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <AuditLogDetailsDialog log={log} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
