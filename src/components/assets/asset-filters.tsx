"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AssetStatus, LocationType } from "@/types/asset";
import { RAM_OPTIONS } from "@/lib/hardware-specs";

const STATUS_OPTIONS: { value: AssetStatus; label: string }[] = [
  { value: "AVAILABLE", label: "Available" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "RETURN_REQUESTED", label: "Return requested" },
  { value: "IN_REPAIR", label: "In repair" },
  { value: "RETIRED", label: "Retired" },
];

const LOCATION_TYPE_OPTIONS: { value: LocationType; label: string }[] = [
  { value: "OFFICE", label: "Office" },
  { value: "REMOTE", label: "Remote" },
  { value: "OTHER", label: "Other" },
];

export function AssetFilters({ types }: { types: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  const status = searchParams.get("status") ?? "";
  const type = searchParams.get("type") ?? "";
  const locationType = searchParams.get("locationType") ?? "";
  const ram = searchParams.get("ram") ?? "";
  const hasFilters = Boolean(search || status || type || locationType || ram);

  function pushParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    startTransition(() => {
      router.push(`/assets?${params.toString()}`);
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    pushParams({ q: search });
  }

  function clearFilters() {
    setSearch("");
    startTransition(() => {
      router.push("/assets");
    });
  }

  return (
    <form
      onSubmit={handleSearchSubmit}
      className="flex flex-wrap items-center gap-2"
    >
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search tag, name, serial..."
        className="w-56"
        aria-label="Search assets"
      />

      <select
        value={status}
        onChange={(e) => pushParams({ status: e.target.value })}
        aria-label="Filter by status"
        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
      >
        <option value="">All statuses</option>
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        value={type}
        onChange={(e) => pushParams({ type: e.target.value })}
        aria-label="Filter by type"
        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
      >
        <option value="">All types</option>
        {types.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <select
        value={locationType}
        onChange={(e) => pushParams({ locationType: e.target.value })}
        aria-label="Filter by location type"
        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
      >
        <option value="">All locations</option>
        {LOCATION_TYPE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        value={ram}
        onChange={(e) => pushParams({ ram: e.target.value })}
        aria-label="Filter by RAM"
        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
      >
        <option value="">All RAM</option>
        {RAM_OPTIONS.map((r) => (
          <option key={r} value={r}>
            {r}
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
          Clear filters
        </Button>
      ) : null}
    </form>
  );
}
