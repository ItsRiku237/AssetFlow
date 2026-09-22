"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SELECT_CLS =
  "h-9 rounded-md border border-input bg-background/50 px-3 text-sm shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

function formatOptionLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

export function AuditLogFilters({
  actions,
  entityTypes,
}: {
  actions: string[];
  entityTypes: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  const action = searchParams.get("action") ?? "";
  const entityType = searchParams.get("entityType") ?? "";
  const hasFilters = Boolean(search || action || entityType);

  function pushParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page");
    startTransition(() => {
      router.push(`/audit-logs?${params.toString()}`);
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    pushParams({ q: search });
  }

  function clearFilters() {
    setSearch("");
    startTransition(() => router.push("/audit-logs"));
  }

  return (
    <form
      onSubmit={handleSearchSubmit}
      className="flex flex-wrap items-center gap-2"
    >
      {/* Search with icon */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search actor name or email…"
          className="w-64 bg-background/50 pl-8"
          aria-label="Search by actor"
        />
      </div>

      <select
        value={action}
        onChange={(e) => pushParams({ action: e.target.value })}
        aria-label="Filter by action"
        className={SELECT_CLS}
      >
        <option value="">All actions</option>
        {actions.map((value) => (
          <option key={value} value={value}>
            {formatOptionLabel(value)}
          </option>
        ))}
      </select>

      <select
        value={entityType}
        onChange={(e) => pushParams({ entityType: e.target.value })}
        aria-label="Filter by entity type"
        className={SELECT_CLS}
      >
        <option value="">All entity types</option>
        {entityTypes.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>

      <Button type="submit" variant="secondary" size="sm" disabled={isPending}>
        Search
      </Button>

      {hasFilters ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          disabled={isPending}
        >
          <X className="size-4" />
          Clear
        </Button>
      ) : null}
    </form>
  );
}
