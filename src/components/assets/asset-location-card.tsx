import { MapPin } from "lucide-react";

import { GlassCard } from "@/components/design-system/glass-card";
import type { AssetLocationData } from "@/types/asset";

function LocationRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

function OfficeLocationDetail({ location }: { location: AssetLocationData }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
      <LocationRow label="Building" value={location.building} />
      <LocationRow label="Floor" value={location.floor} />
      <LocationRow label="Room" value={location.room} />
      <LocationRow label="Desk / Seat" value={location.desk} />
    </dl>
  );
}

export function AssetLocationCard({
  location,
}: {
  location: AssetLocationData | null;
}) {
  return (
    <GlassCard className="space-y-3 p-4">
      <div className="flex items-center gap-2">
        <MapPin className="size-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">Physical Location</h2>
      </div>

      {!location ? (
        <p className="text-sm text-muted-foreground">Location not specified.</p>
      ) : location.locationType === "OFFICE" ? (
        <div className="space-y-3">
          <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
            Office
          </span>
          {location.building ||
          location.floor ||
          location.room ||
          location.desk ? (
            <OfficeLocationDetail location={location} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Office — no further details recorded.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {location.locationType === "REMOTE" ? "Remote" : "Other"}
          </span>
          <p className="text-sm">{location.description}</p>
        </div>
      )}
    </GlassCard>
  );
}

/** Compact one-line summary for the asset list table. */
export function formatLocationSummary(
  location: AssetLocationData | null
): string | null {
  if (!location) return null;
  if (location.locationType === "REMOTE") return "Remote";
  if (location.locationType === "OTHER") return location.description ?? "Other";
  // OFFICE
  const parts = [location.building, location.floor, location.room].filter(
    Boolean
  ) as string[];
  return parts.length > 0 ? parts.join(" · ") : "Office";
}
