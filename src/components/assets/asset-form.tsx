"use client";

import { useActionState, useState, useId } from "react";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  isHardwareAsset,
  PROCESSOR_LIST,
  RAM_OPTIONS,
  STORAGE_OPTIONS,
  STORAGE_TYPE_OPTIONS,
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

// ── helpers ──────────────────────────────────────────────────────────

/** Resolve a stored value into {selectVal, customVal}. */
function resolveSpec(
  value: string | undefined,
  knownValues: readonly string[]
): { selectVal: string; customVal: string } {
  if (!value) return { selectVal: "", customVal: "" };
  if ((knownValues as readonly string[]).includes(value)) {
    return { selectVal: value, customVal: "" };
  }
  return { selectVal: "__custom__", customVal: value };
}

// ── main form ────────────────────────────────────────────────────────

export function AssetForm({
  action,
  defaultValues,
  submitLabel,
}: AssetFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const uid = useId();

  // Track the asset type to show/hide hardware fields
  const [assetType, setAssetType] = useState(defaultValues?.type ?? "");
  const showHardware = isHardwareAsset(assetType);

  // Processor
  const procResolved = resolveSpec(
    defaultValues?.processor,
    PROCESSOR_LIST
  );
  const [procSelect, setProcSelect] = useState(procResolved.selectVal);
  const [procCustom, setProcCustom] = useState(procResolved.customVal);

  // RAM
  const ramResolved = resolveSpec(defaultValues?.ram, RAM_OPTIONS);
  const [ramSelect, setRamSelect] = useState(ramResolved.selectVal);
  const [ramCustom, setRamCustom] = useState(ramResolved.customVal);

  // Storage
  const storResolved = resolveSpec(defaultValues?.storage, STORAGE_OPTIONS);
  const [storSelect, setStorSelect] = useState(storResolved.selectVal);
  const [storCustom, setStorCustom] = useState(storResolved.customVal);

  // Storage type
  const stResolved = resolveSpec(
    defaultValues?.storageType,
    STORAGE_TYPE_OPTIONS
  );
  const [stSelect, setStSelect] = useState(stResolved.selectVal);
  const [stCustom, setStCustom] = useState(stResolved.customVal);

  // Build the final value to be submitted for a spec field
  function resolvedValue(selectVal: string, customVal: string) {
    if (selectVal === "__custom__") return customVal.trim() || undefined;
    return selectVal || undefined;
  }

  const SELECT_CLS =
    "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      {state.error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      {/* ── Core asset fields ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
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
          <div className="space-y-1.5">
            <label htmlFor={`${uid}-type`} className="text-sm font-medium">
              Type / category *
            </label>
            <Input
              id={`${uid}-type`}
              name="type"
              value={assetType}
              onChange={(e) => setAssetType(e.target.value)}
              placeholder="Laptop, Monitor, Phone..."
              required
            />
          </div>
          <Field label="Brand" name="brand" defaultValue={defaultValues?.brand} />
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
            placeholder="https://..."
          />
        </div>
      </section>

      {/* ── Hardware Specifications ── */}
      {showHardware ? (
        <section className="space-y-3 rounded-lg border border-border p-4">
          <h2 className="text-sm font-semibold">Hardware Specifications</h2>
          <p className="text-xs text-muted-foreground">
            Choose a predefined value or select &quot;Custom&quot; to enter a
            specific model.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Processor */}
            <div className="space-y-1.5">
              <label htmlFor={`${uid}-proc`} className="text-sm font-medium">
                Processor
              </label>
              <select
                id={`${uid}-proc`}
                value={procSelect}
                onChange={(e) => setProcSelect(e.target.value)}
                className={SELECT_CLS}
                aria-label="Processor"
              >
                <option value="">Not specified</option>
                {PROCESSOR_LIST.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
                <option value="__custom__">Custom…</option>
              </select>
              {procSelect === "__custom__" ? (
                <Input
                  value={procCustom}
                  onChange={(e) => setProcCustom(e.target.value)}
                  placeholder="e.g. Intel Core Ultra 7"
                  className="mt-1"
                />
              ) : null}
              {/* Hidden field that carries the final resolved value */}
              <input
                type="hidden"
                name="processor"
                value={resolvedValue(procSelect, procCustom) ?? ""}
              />
            </div>

            {/* RAM */}
            <div className="space-y-1.5">
              <label htmlFor={`${uid}-ram`} className="text-sm font-medium">
                RAM
              </label>
              <select
                id={`${uid}-ram`}
                value={ramSelect}
                onChange={(e) => setRamSelect(e.target.value)}
                className={SELECT_CLS}
                aria-label="RAM"
              >
                <option value="">Not specified</option>
                {RAM_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
                <option value="__custom__">Custom…</option>
              </select>
              {ramSelect === "__custom__" ? (
                <Input
                  value={ramCustom}
                  onChange={(e) => setRamCustom(e.target.value)}
                  placeholder="e.g. 48 GB"
                  className="mt-1"
                />
              ) : null}
              <input
                type="hidden"
                name="ram"
                value={resolvedValue(ramSelect, ramCustom) ?? ""}
              />
            </div>

            {/* Storage capacity */}
            <div className="space-y-1.5">
              <label htmlFor={`${uid}-stor`} className="text-sm font-medium">
                Storage
              </label>
              <select
                id={`${uid}-stor`}
                value={storSelect}
                onChange={(e) => setStorSelect(e.target.value)}
                className={SELECT_CLS}
                aria-label="Storage"
              >
                <option value="">Not specified</option>
                {STORAGE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
                <option value="__custom__">Custom…</option>
              </select>
              {storSelect === "__custom__" ? (
                <Input
                  value={storCustom}
                  onChange={(e) => setStorCustom(e.target.value)}
                  placeholder="e.g. 3 TB"
                  className="mt-1"
                />
              ) : null}
              <input
                type="hidden"
                name="storage"
                value={resolvedValue(storSelect, storCustom) ?? ""}
              />
            </div>

            {/* Storage type */}
            <div className="space-y-1.5">
              <label htmlFor={`${uid}-st`} className="text-sm font-medium">
                Storage Type
              </label>
              <select
                id={`${uid}-st`}
                value={stSelect}
                onChange={(e) => setStSelect(e.target.value)}
                className={SELECT_CLS}
                aria-label="Storage type"
              >
                <option value="">Not specified</option>
                {STORAGE_TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
                <option value="__custom__">Custom…</option>
              </select>
              {stSelect === "__custom__" ? (
                <Input
                  value={stCustom}
                  onChange={(e) => setStCustom(e.target.value)}
                  placeholder="e.g. Hybrid SSHD"
                  className="mt-1"
                />
              ) : null}
              <input
                type="hidden"
                name="storageType"
                value={resolvedValue(stSelect, stCustom) ?? ""}
              />
            </div>
          </div>
        </section>
      ) : (
        /* Non-hardware assets: pass through whatever existing values so we
           don't accidentally clear them if the type is changed. */
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
        {isPending ? <Loader2 className="animate-spin" /> : <Save className="size-4" />}
        {submitLabel}
      </Button>
    </form>
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
