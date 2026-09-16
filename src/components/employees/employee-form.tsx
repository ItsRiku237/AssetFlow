"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EmployeeActionState } from "@/lib/actions/employee-actions";
import type { EmployeeStatus } from "@/types/employee";

export interface EmployeeFormDefaultValues {
  employeeCode?: string;
  name?: string;
  email?: string;
  department?: string;
  designation?: string;
  status?: EmployeeStatus;
}

interface EmployeeFormProps {
  action: (
    prevState: EmployeeActionState,
    formData: FormData
  ) => Promise<EmployeeActionState>;
  defaultValues?: EmployeeFormDefaultValues;
  submitLabel: string;
  /** Show the Employee status select — only relevant when editing. */
  showStatus?: boolean;
}

const initialState: EmployeeActionState = { error: null };

export function EmployeeForm({
  action,
  defaultValues,
  submitLabel,
  showStatus = false,
}: EmployeeFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {state.error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Employee ID"
          name="employeeCode"
          defaultValue={defaultValues?.employeeCode}
          required
        />
        <Field
          label="Full name"
          name="name"
          defaultValue={defaultValues?.name}
          required
        />
        <Field
          label="Email"
          name="email"
          type="email"
          defaultValue={defaultValues?.email}
          placeholder="Optional — set once they have an account"
        />
        <Field
          label="Department"
          name="department"
          defaultValue={defaultValues?.department}
          placeholder="Optional"
        />
        <Field
          label="Position"
          name="designation"
          defaultValue={defaultValues?.designation}
          placeholder="Optional"
        />

        {showStatus ? (
          <div className="space-y-1.5">
            <label htmlFor="status" className="text-sm font-medium">
              Employee status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={defaultValues?.status ?? "ACTIVE"}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Deactivated</option>
            </select>
          </div>
        ) : null}
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
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
}

function Field({
  label,
  name,
  type = "text",
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
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}
