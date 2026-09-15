import Link from "next/link";

import { Button } from "@/components/ui/button";

interface AuditLogPaginationProps {
  page: number;
  pageCount: number;
  totalCount: number;
  pageSize: number;
  /** Current filters (q/action/entityType) to preserve across page links. */
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
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        {totalCount === 0
          ? "No records"
          : `Showing ${start}–${end} of ${totalCount}`}
      </p>
      <div className="flex items-center gap-2">
        {page <= 1 ? (
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
        ) : (
          <Button asChild variant="outline" size="sm">
            <Link href={buildHref(page - 1, searchParams)}>Previous</Link>
          </Button>
        )}
        <span className="text-sm text-muted-foreground">
          Page {page} of {pageCount}
        </span>
        {page >= pageCount ? (
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        ) : (
          <Button asChild variant="outline" size="sm">
            <Link href={buildHref(page + 1, searchParams)}>Next</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
