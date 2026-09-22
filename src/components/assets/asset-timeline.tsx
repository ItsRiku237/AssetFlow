"use client";

import { useState } from "react";
import {
  Clock,
  ClipboardList,
  MapPin,
  Receipt,
  Undo2,
  UserCheck,
  Wrench,
  Zap,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { TimelineCategory, TimelineEvent } from "@/lib/data/asset-timeline";

// ─── Category metadata ────────────────────────────────────────────────────────

interface CategoryMeta {
  label: string;
  icon: React.ElementType;
  dot: string;
}

const CATEGORY_META: Record<TimelineCategory, CategoryMeta> = {
  lifecycle:     { label: "Lifecycle",     icon: Zap,           dot: "bg-primary" },
  assignment:    { label: "Assignment",    icon: UserCheck,      dot: "bg-success" },
  return:        { label: "Return",        icon: Undo2,          dot: "bg-warning" },
  repair:        { label: "Repair",        icon: Wrench,         dot: "bg-orange-500" },
  request:       { label: "Request",       icon: ClipboardList,  dot: "bg-blue-500" },
  reimbursement: { label: "Reimbursement", icon: Receipt,        dot: "bg-purple-500" },
  location:      { label: "Location",      icon: MapPin,         dot: "bg-teal-500" },
};

// ─── Filter tabs ──────────────────────────────────────────────────────────────

type Filter = "all" | TimelineCategory;

const FILTER_TABS: { value: Filter; label: string }[] = [
  { value: "all",           label: "All" },
  { value: "lifecycle",     label: "Lifecycle" },
  { value: "assignment",    label: "Assignment" },
  { value: "return",        label: "Return" },
  { value: "repair",        label: "Repair" },
  { value: "request",       label: "Request" },
  { value: "reimbursement", label: "Reimbursement" },
  { value: "location",      label: "Location" },
];

// ─── Date formatting ─────────────────────────────────────────────────────────

function formatEventDate(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d),
    time: new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(d),
  };
}

// ─── Single event row ─────────────────────────────────────────────────────────

function EventRow({ event }: { event: TimelineEvent }) {
  const meta = CATEGORY_META[event.category];
  const Icon = meta.icon;
  const { date, time } = formatEventDate(event.timestamp);

  return (
    <div className="relative flex gap-3 pb-5 last:pb-0">
      {/* Vertical line — hidden on last item via CSS */}
      <div className="absolute left-[17px] top-8 bottom-0 w-px bg-border last:hidden" />

      {/* Icon dot */}
      <div className={cn(
        "relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full shadow-sm glow-icon-chip",
      )}>
        <Icon className="size-4 text-muted-foreground" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 pt-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p className="text-sm font-medium leading-snug">{event.title}</p>
          {event.subjectName ? (
            <span className="text-xs text-muted-foreground">
              {event.subjectName}
            </span>
          ) : null}
          {event.actorName ? (
            <span className="text-xs text-muted-foreground/70">
              by {event.actorName}
            </span>
          ) : null}
        </div>
        {event.detail ? (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
            {event.detail}
          </p>
        ) : null}
        <p className="mt-1 text-xs text-muted-foreground/60">
          {date} · {time}
        </p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface AssetTimelineProps {
  events: TimelineEvent[];
}

export function AssetTimeline({ events }: AssetTimelineProps) {
  const [filter, setFilter] = useState<Filter>("all");

  // Only show tabs for categories that actually have events.
  const presentCategories = new Set(events.map((e) => e.category));
  const visibleTabs = FILTER_TABS.filter(
    (t) => t.value === "all" || presentCategories.has(t.value as TimelineCategory)
  );

  const filtered =
    filter === "all" ? events : events.filter((e) => e.category === filter);

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
        <Clock className="size-7 text-muted-foreground" />
        <p className="text-sm font-medium">No timeline events yet</p>
        <p className="text-xs text-muted-foreground">
          Events will appear here as activity is recorded for this asset.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs — scrollable on mobile */}
      {visibleTabs.length > 2 ? (
        <div className="flex gap-1 overflow-x-auto pb-1">
          {visibleTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={cn(
                "shrink-0 rounded-md px-3 py-1 text-xs font-medium transition-colors",
                filter === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              {tab.label}
              {tab.value !== "all" ? (
                <span className="ml-1.5 opacity-60">
                  {events.filter((e) => e.category === tab.value).length}
                </span>
              ) : (
                <span className="ml-1.5 opacity-60">{events.length}</span>
              )}
            </button>
          ))}
        </div>
      ) : null}

      {/* Events */}
      {filtered.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">
          No events in this category.
        </p>
      ) : (
        <div className="relative pl-1">
          {filtered.map((event, i) => (
            <EventRow key={`${event.timestamp}-${event.category}-${event.title}-${i}`} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
