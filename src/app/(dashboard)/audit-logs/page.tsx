import { ScrollText } from "lucide-react";

import { AuditLogFilters } from "@/components/audit-logs/audit-log-filters";
import { AuditLogPagination } from "@/components/audit-logs/audit-log-pagination";
import { AuditLogTable } from "@/components/audit-logs/audit-log-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { requireRole } from "@/lib/auth-guards";
import {
  getAuditLogActions,
  getAuditLogEntityTypes,
  getAuditLogs,
} from "@/lib/data/audit-logs";

interface AuditLogsPageProps {
  searchParams: Promise<{
    q?: string;
    action?: string;
    entityType?: string;
    page?: string;
  }>;
}

export default async function AuditLogsPage({
  searchParams,
}: AuditLogsPageProps) {
  // Server-side authorization boundary — this is what actually keeps
  // an EMPLOYEE out, not the sidebar/proxy alone (see auth-guards.ts).
  await requireRole("ADMIN");

  const params = await searchParams;
  const search = params.q?.trim() || undefined;
  const action = params.action?.trim() || undefined;
  const entityType = params.entityType?.trim() || undefined;
  const requestedPage = Number(params.page) || 1;

  const [result, actions, entityTypes] = await Promise.all([
    getAuditLogs({ search, action, entityType }, requestedPage),
    getAuditLogActions(),
    getAuditLogEntityTypes(),
  ]);

  const hasActiveFilters = Boolean(search || action || entityType);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="A record of significant actions taken across AssetFlow."
      />

      <AuditLogFilters actions={actions} entityTypes={entityTypes} />

      {result.items.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No audit records found"
          description={
            hasActiveFilters
              ? "Try adjusting or clearing your filters."
              : "Actions like assigning assets, approving returns, or logging repairs will appear here."
          }
        />
      ) : (
        <>
          <AuditLogTable logs={result.items} />
          <AuditLogPagination
            page={result.page}
            pageCount={result.pageCount}
            totalCount={result.totalCount}
            pageSize={result.pageSize}
            searchParams={{ q: search, action, entityType }}
          />
        </>
      )}
    </div>
  );
}
