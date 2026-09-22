import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/design-system/glass-card";

interface AuditLogPaginationProps {
  page: number;
  pageCount: number;
  totalCount: number;
  pageSize: number;
  searchParams: Record<string, string | undefined>;
}

function buildHref(
  page: number,
  searchParams: Record<string, string | undefined>
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value) params.set(key, value);
  }
  params.set("page", String(page));
  return `/audit-logs?${params.toString()}`;
}

export function AuditLogPagination({
  page,
  pageCount,
  totalCount,
  pageSize,
  searchParams,
}: AuditLogPaginationProps) {
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);

  return (
    <GlassCard className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <p className="text-sm text-muted-foreground">
        {totalCount === 0
          ? "No records"
          : `Showing ${start}–${end} of ${totalCount.toLocaleString()} records`}
      </p>
      <div className="flex items-center gap-2">
        {page <= 1 ? (
          <Button variant="outline" size="sm" disabled className="gap-1">
            <ChevronLeft className="size-3.5" />
            Previous
          </Button>
        ) : (
          <Button asChild variant="outline" size="sm" className="gap-1">
            <Link href={buildHref(page - 1, searchParams)}>
              <ChevronLeft className="size-3.5" />
              Previous
            </Link>
          </Button>
        )}
        <span className="text-sm text-muted-foreground tabular-nums">
          {page} / {pageCount}
        </span>
        {page >= pageCount ? (
          <Button variant="outline" size="sm" disabled className="gap-1">
            Next
            <ChevronRight className="size-3.5" />
          </Button>
        ) : (
          <Button asChild variant="outline" size="sm" className="gap-1">
            <Link href={buildHref(page + 1, searchParams)}>
              Next
              <ChevronRight className="size-3.5" />
            </Link>
          </Button>
        )}
      </div>
    </GlassCard>
  );
}
