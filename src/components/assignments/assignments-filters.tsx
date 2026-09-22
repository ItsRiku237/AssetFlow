"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AssignmentsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  const status = searchParams.get("status") ?? "";
  const hasFilters = Boolean(search || status);

  function pushParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    startTransition(() => {
      router.push(`/assignments?${params.toString()}`);
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    pushParams({ q: search });
  }

  function clearFilters() {
    setSearch("");
    startTransition(() => router.push("/assignments"));
  }

  return (
    <form
      onSubmit={handleSearchSubmit}
      className="flex flex-wrap items-center gap-2"
    >
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search asset, employee..."
        className="w-56 bg-background/50"
        aria-label="Search assignments"
      />

      <select
        value={status}
        onChange={(e) => pushParams({ status: e.target.value })}
        aria-label="Filter by custody status"
        className="h-9 rounded-md border border-input bg-background/50 px-3 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
      >
        <option value="">All assignments</option>
        <option value="ACTIVE">Active only</option>
        <option value="RETURNED">Returned only</option>
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
