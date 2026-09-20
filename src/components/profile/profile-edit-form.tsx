"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  updateProfile,
  type ProfileActionState,
} from "@/lib/actions/profile-actions";

interface ProfileEditFormProps {
  initialName: string;
  initialPhone?: string | null;
  showPhone?: boolean;
  isAdmin?: boolean;
}

const initialState: ProfileActionState = { error: null, success: false };

export function ProfileEditForm({
  initialName,
  initialPhone,
  showPhone = true,
  isAdmin = false,
}: ProfileEditFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfile, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      ) : null}

      {state.success ? (
        <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>Profile details updated successfully.</span>
        </div>
      ) : null}

      <div className={`grid gap-4 ${showPhone ? "sm:grid-cols-2" : "grid-cols-1"}`}>
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            Full Name <span className="text-destructive">*</span>
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            defaultValue={initialName}
            required
            maxLength={120}
            placeholder="Your full name"
          />
        </div>

        {showPhone ? (
          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-sm font-medium">
              Contact Phone Number
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={initialPhone ?? ""}
              maxLength={30}
              placeholder="e.g. +1 (555) 012-3456"
            />
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {isAdmin
            ? "Email, role, and security credentials cannot be modified here."
            : "Organization, email, and role settings are managed by your administrator."}
        </p>
        <Button type="submit" disabled={isPending} size="sm" className="shrink-0">
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          <span>Save Changes</span>
        </Button>
      </div>
    </form>
  );
}
