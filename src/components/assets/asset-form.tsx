"use client";

import { useActionState, useState, useId } from "react";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SpecSelect } from "@/components/assets/spec-select";
import { GlassCard } from "@/components/design-system/glass-card";
import {
  isHardwareAsset,
  ASSET_TYPE_LIST,
  getBrandsForType,
  PROCESSOR_LIST,
  RAM_OPTIONS,
  STORAGE_OPTIONS,
  STORAGE_TYPE_OPTIONS,
  SPEC_STORAGE_PREFIX,
} from "@/lib/hardware-specs";
import type { AssetActionState } from "@/lib/actions/asset-actions";

export interface AssetFormDefaultValues {
  assetTag?: string;
  name?: string;
  type?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  processor?: string;
  ram?: string;
  storage?: string;
  storageType?: string;
  purchaseDate?: string;
  purchasePrice?: string;
  warrantyExpiry?: string;
  imageUrl?: string;
}

interface AssetFormProps {
  action: (
    prevState: AssetActionState,
    formData: FormData
  ) => Promise<AssetActionState>;
  defaultValues?: AssetFormDefaultValues;
  submitLabel: string;
}

const initialState: AssetActionState = { error: null };
const CUSTOM_TYPE_SENTINEL = "__custom_type__";
const CUSTOM_BRAND_SENTINEL = "__custom_brand__";

const SELECT_CLS =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

export function AssetForm({
  action,
  defaultValues,
  submitLabel,
}: AssetFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const uid = useId();

  // ── Type / category ───────────────────────────────────────────────
  const initType = defaultValues?.type ?? "";
  const typeIsPredefined =
    !initType || (ASSET_TYPE_LIST as readonly string[]).includes(initType);

  const [typeSelect, setTypeSelect] = useState(
    typeIsPredefined ? initType : CUSTOM_TYPE_SENTINEL
  );
  const [typeCustom, setTypeCustom] = useState(
    typeIsPredefined ? "" : initType
  );

  const resolvedType =
    typeSelect === CUSTOM_TYPE_SENTINEL ? typeCustom.trim() : typeSelect;

  const showHardware = isHardwareAsset(resolvedType);

  // ── Custom type values from localStorage ─────────────────────────
  const [savedCustomTypes, setSavedCustomTypes] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(SPEC_STORAGE_PREFIX + "assetType");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const saveCustomType = () => {
    const val = typeCustom.trim();
    if (!val) return;
    const updated = savedCustomTypes.includes(val)
      ? savedCustomTypes
      : [val, ...savedCustomTypes];
    setSavedCustomTypes(updated);
    localStorage.setItem(
      SPEC_STORAGE_PREFIX + "assetType",
      JSON.stringify(updated)
    );
  };

  const deleteCustomType = (val: string) => {
    const updated = savedCustomTypes.filter((v) => v !== val);
    setSavedCustomTypes(updated);
    localStorage.setItem(
      SPEC_STORAGE_PREFIX + "assetType",
      JSON.stringify(updated)
    );
  };

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      {state.error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      {/* ── Asset Information ─────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Asset Information
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Asset tag"
            name="assetTag"
            defaultValue={defaultValues?.assetTag}
            required
          />
          <Field
            label="Name"
            name="name"
            defaultValue={defaultValues?.name}
            required
          />

          {/* Type / category */}
          <div className="space-y-1.5">
            <label htmlFor={`${uid}-type`} className="text-sm font-medium">
              Type / category *
            </label>
            <select
              id={`${uid}-type`}
              value={typeSelect}
              onChange={(e) => {
                setTypeSelect(e.target.value);
                if (e.target.value !== CUSTOM_TYPE_SENTINEL) setTypeCustom("");
              }}
              className={SELECT_CLS}
              aria-label="Asset type"
            >
              <option value="">— Select type —</option>
              {ASSET_TYPE_LIST.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
              {savedCustomTypes.length > 0 && (
                <optgroup label="Custom (saved)">
                  {savedCustomTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </optgroup>
              )}
              <option value={CUSTOM_TYPE_SENTINEL}>＋ Custom type…</option>
            </select>

            {typeSelect === CUSTOM_TYPE_SENTINEL ? (
              <div className="flex gap-2">
                <Input
                  value={typeCustom}
                  onChange={(e) => setTypeCustom(e.target.value)}
                  placeholder="e.g. Smart TV, Drone…"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      saveCustomType();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={saveCustomType}
                  disabled={!typeCustom.trim()}
                >
                  Save
                </Button>
              </div>
            ) : null}

            {savedCustomTypes.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {savedCustomTypes.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs"
                  >
                    <button
                      type="button"
                      className="hover:underline"
                      onClick={() => {
                        setTypeSelect(t);
                        setTypeCustom("");
                      }}
                    >
                      {t}
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${t}`}
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => deleteCustomType(t)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Hidden input carries the resolved type value */}
            <input type="hidden" name="type" value={resolvedType} />
          </div>

          {/* Brand — keyed on resolvedType so the component fully remounts
              (resetting brand selection) whenever the asset type changes.
              This ensures brand suggestions always match the current type
              and stale selections from a previous type are cleared. */}
          <BrandField
            key={resolvedType}
            uid={uid}
            resolvedType={resolvedType}
            initialBrand={defaultValues?.brand ?? ""}
          />

          <Field label="Model" name="model" defaultValue={defaultValues?.model} />
          <Field
            label="Serial number"
            name="serialNumber"
            defaultValue={defaultValues?.serialNumber}
          />
          <Field
            label="Purchase date"
            name="purchaseDate"
            type="date"
            defaultValue={defaultValues?.purchaseDate}
          />
          <Field
            label="Purchase price"
            name="purchasePrice"
            type="number"
            step="0.01"
            defaultValue={defaultValues?.purchasePrice}
          />
          <Field
            label="Warranty expiry"
            name="warrantyExpiry"
            type="date"
            defaultValue={defaultValues?.warrantyExpiry}
          />
          <Field
            label="Image URL"
            name="imageUrl"
            defaultValue={defaultValues?.imageUrl}
            placeholder="https://…"
          />
        </div>
      </section>

      {/* ── Hardware Specifications ─────────────────────────────────── */}
      {showHardware ? (
        <GlassCard className="space-y-4 p-4">
          <div>
            <h2 className="text-sm font-semibold">Hardware Specifications</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select a predefined value or add a custom entry. Custom entries
              are saved locally for reuse.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SpecSelect
              label="Processor"
              name="processor"
              predefined={PROCESSOR_LIST}
              storageKey="processor"
              defaultValue={defaultValues?.processor}
              placeholder="e.g. Intel Core Ultra 7"
            />
            <SpecSelect
              label="RAM"
              name="ram"
              predefined={RAM_OPTIONS}
              storageKey="ram"
              defaultValue={defaultValues?.ram}
              placeholder="e.g. 48 GB"
            />
            <SpecSelect
              label="Storage"
              name="storage"
              predefined={STORAGE_OPTIONS}
              storageKey="storage"
              defaultValue={defaultValues?.storage}
              placeholder="e.g. 3 TB"
            />
            <SpecSelect
              label="Storage Type"
              name="storageType"
              predefined={STORAGE_TYPE_OPTIONS}
              storageKey="storageType"
              defaultValue={defaultValues?.storageType}
              placeholder="e.g. Hybrid SSHD"
            />
          </div>
        </GlassCard>
      ) : (
        /* Preserve any existing spec values when type is non-hardware */
        <>
          <input
            type="hidden"
            name="processor"
            value={defaultValues?.processor ?? ""}
          />
          <input type="hidden" name="ram" value={defaultValues?.ram ?? ""} />
          <input
            type="hidden"
            name="storage"
            value={defaultValues?.storage ?? ""}
          />
          <input
            type="hidden"
            name="storageType"
            value={defaultValues?.storageType ?? ""}
          />
        </>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Save className="size-4" />
        )}
        {submitLabel}
      </Button>
    </form>
  );
}

// ── Brand field — isolated component so keying it on resolvedType
//   gives us a clean remount (fresh useState) each time the type changes.
// ─────────────────────────────────────────────────────────────────────

interface BrandFieldProps {
  uid: string;
  resolvedType: string;
  initialBrand: string;
}

function BrandField({ uid, resolvedType, initialBrand }: BrandFieldProps) {
  const brandList = getBrandsForType(resolvedType);

  // Determine initial select value based on whether the existing brand
  // is in the predefined list for this type.
  const initSelect = !initialBrand
    ? ""
    : brandList.includes(initialBrand)
    ? initialBrand
    : CUSTOM_BRAND_SENTINEL;

  const [brandSelect, setBrandSelect] = useState(initSelect);
  const [brandCustom, setBrandCustom] = useState(
    initSelect === CUSTOM_BRAND_SENTINEL ? initialBrand : ""
  );

  const resolvedBrand =
    brandSelect === CUSTOM_BRAND_SENTINEL ? brandCustom.trim() : brandSelect;

  return (
    <div className="space-y-1.5">
      <label htmlFor={`${uid}-brand`} className="text-sm font-medium">
        Brand
      </label>

      {brandList.length > 0 ? (
        <>
          <select
            id={`${uid}-brand`}
            value={brandSelect}
            onChange={(e) => {
              setBrandSelect(e.target.value);
              if (e.target.value !== CUSTOM_BRAND_SENTINEL) setBrandCustom("");
            }}
            className={SELECT_CLS}
            aria-label="Brand"
          >
            <option value="">Not specified</option>
            {brandList.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
            <option value={CUSTOM_BRAND_SENTINEL}>＋ Other brand…</option>
          </select>
          {brandSelect === CUSTOM_BRAND_SENTINEL ? (
            <Input
              value={brandCustom}
              onChange={(e) => setBrandCustom(e.target.value)}
              placeholder="Enter brand name"
            />
          ) : null}
        </>
      ) : (
        <Input
          id={`${uid}-brand`}
          value={resolvedBrand}
          onChange={(e) => {
            setBrandSelect(CUSTOM_BRAND_SENTINEL);
            setBrandCustom(e.target.value);
          }}
          placeholder="Brand name"
        />
      )}

      <input type="hidden" name="brand" value={resolvedBrand} />
    </div>
  );
}

// ── plain text field ──────────────────────────────────────────────────

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  step?: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
}

function Field({
  label,
  name,
  type = "text",
  step,
  defaultValue,
  required,
  placeholder,
}: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
        {required ? " *" : ""}
      </label>
      <Input
        id={name}
        name={name}
        type={type}
        step={step}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}
