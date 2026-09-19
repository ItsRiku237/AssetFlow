"use client";

import { useActionState, useState } from "react";
import { Loader2, MapPin, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  upsertAssetLocation,
  removeAssetLocation,
  type LocationActionState,
} from "@/lib/actions/location-actions";
import type { AssetLocationData, LocationType } from "@/types/asset";

const LOCATION_TYPES: { value: LocationType; label: string }[] = [
  { value: "OFFICE", label: "Office" },
  { value: "REMOTE", label: "Remote" },
  { value: "OTHER", label: "Other" },
];

const initialState: LocationActionState = { error: null };

interface AssetLocationFormProps {
  assetId: string;
  existingLocation: AssetLocationData | null;
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <Input
        id={name}
        name={name}
        defaultValue={defaultValue ?? undefined}
        placeholder={placeholder}
      />
    </div>
  );
}

export function AssetLocationForm({
  assetId,
  existingLocation,
}: AssetLocationFormProps) {
  const [locationType, setLocationType] = useState<LocationType>(
    existingLocation?.locationType ?? "OFFICE"
  );

  const boundUpsert = upsertAssetLocation.bind(null, assetId);
  const boundRemove = removeAssetLocation.bind(null, assetId);

  const [saveState, saveFormAction, isSaving] = useActionState(
    boundUpsert,
    initialState
  );
  const [removeState, removeFormAction, isRemoving] = useActionState(
    boundRemove,
    initialState
  );

  const busy = isSaving || isRemoving;
  const errorMessage = saveState.error ?? removeState.error;

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <MapPin className="size-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">
          {existingLocation ? "Edit Physical Location" : "Set Physical Location"}
        </h2>
      </div>

      {errorMessage ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}

      <form action={saveFormAction} className="space-y-4">
        {/* Location type selector */}
        <div className="space-y-1.5">
          <label htmlFor="locationType" className="text-sm font-medium">
            Location type *
          </label>
          <select
            id="locationType"
            name="locationType"
            value={locationType}
            onChange={(e) => setLocationType(e.target.value as LocationType)}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            required
          >
            {LOCATION_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Conditional fields */}
        {locationType === "OFFICE" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Building / Office"
              name="building"
              defaultValue={
                existingLocation?.locationType === "OFFICE"
                  ? existingLocation.building
                  : null
              }
              placeholder="Main Office"
            />
            <Field
              label="Floor"
              name="floor"
              defaultValue={
                existingLocation?.locationType === "OFFICE"
                  ? existingLocation.floor
                  : null
              }
              placeholder="Floor 3"
            />
            <Field
              label="Room"
              name="room"
              defaultValue={
                existingLocation?.locationType === "OFFICE"
                  ? existingLocation.room
                  : null
              }
              placeholder="Room 302"
            />
            <Field
              label="Desk / Seat"
              name="desk"
              defaultValue={
                existingLocation?.locationType === "OFFICE"
                  ? existingLocation.desk
                  : null
              }
              placeholder="Desk D-18"
            />
          </div>
        ) : (
          <div className="space-y-1.5">
            <label htmlFor="description" className="text-sm font-medium">
              Location description *
            </label>
            <Textarea
              id="description"
              name="description"
              defaultValue={
                existingLocation?.locationType !== "OFFICE"
                  ? (existingLocation?.description ?? undefined)
                  : undefined
              }
              placeholder={
                locationType === "REMOTE"
                  ? "Employee home workspace — New Delhi"
                  : "Repair center, warehouse, etc."
              }
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" size="sm" disabled={busy}>
            {isSaving ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {existingLocation ? "Update location" : "Save location"}
          </Button>
        </div>
      </form>

      {existingLocation ? (
        <form action={removeFormAction}>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={busy}
          >
            {isRemoving ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            Remove location
          </Button>
        </form>
      ) : null}
    </div>
  );
}
