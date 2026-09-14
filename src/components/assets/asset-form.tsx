"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export function AssetForm({ action, defaultValues, submitLabel }: AssetFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      {state.error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Asset tag" name="assetTag" defaultValue={defaultValues?.assetTag} required />
        <Field label="Name" name="name" defaultValue={defaultValues?.name} required />
        <Field
          label="Type / category"
          name="type"
          defaultValue={defaultValues?.type}
          placeholder="Laptop, Monitor, Phone..."
          required
        />
        <Field label="Brand" name="brand" defaultValue={defaultValues?.brand} />
        <Field label="Model" name="model" defaultValue={defaultValues?.model} />
        <Field
          label="Serial number"
          name="serialNumber"
          defaultValue={defaultValues?.serialNumber}
        />
        <Field label="Processor" name="processor" defaultValue={defaultValues?.processor} />
        <Field label="RAM" name="ram" defaultValue={defaultValues?.ram} placeholder="16 GB" />
        <Field
          label="Storage"
          name="storage"
          defaultValue={defaultValues?.storage}
          placeholder="512 GB SSD"
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

      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : <Save className="size-4" />}
        {submitLabel}
      </Button>
    </form>
  );
}

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
