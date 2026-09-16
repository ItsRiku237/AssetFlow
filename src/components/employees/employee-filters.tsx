"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EmployeeStatus } from "@/types/employee";

const STATUS_OPTIONS: { value: EmployeeStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Deactivated" },
];

export function EmployeeFilters({ departments }: { departments: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  const department = searchParams.get("department") ?? "";
  const status = searchParams.get("status") ?? "";
  const hasFilters = Boolean(search || department || status);

  function pushParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    startTransition(() => {
      router.push(`/employees?${params.toString()}`);
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    pushParams({ q: search });
  }

  function clearFilters() {
    setSearch("");
    startTransition(() => {
      router.push("/employees");
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
        placeholder="Search name, email, employee ID..."
        className="w-64"
        aria-label="Search employees"
      />

      <select
        value={department}
        onChange={(e) => pushParams({ department: e.target.value })}
        aria-label="Filter by department"
        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
      >
        <option value="">All departments</option>
        {departments.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

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
