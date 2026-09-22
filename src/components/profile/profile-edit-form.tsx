"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, Phone, Save, User } from "lucide-react";

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
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      ) : null}

      {state.success ? (
        <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          <CheckCircle2 className="size-4 shrink-0" />
          Profile updated successfully.
        </div>
      ) : null}

      <div className={`grid gap-3 ${showPhone ? "sm:grid-cols-2" : "grid-cols-1"}`}>
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            Full Name <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={initialName}
              required
              maxLength={120}
              placeholder="Your full name"
              className="pl-8"
            />
          </div>
        </div>

        {showPhone ? (
          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-sm font-medium">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={initialPhone ?? ""}
                maxLength={30}
                placeholder="+1 (555) 012-3456"
                className="pl-8"
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {isAdmin
            ? "Email, role, and security credentials are managed server-side."
            : "Organization, email, and role settings are managed by your administrator."}
        </p>
        <Button type="submit" disabled={isPending} size="sm" className="shrink-0 gap-1.5">
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save Changes
        </Button>
      </div>
    </form>
  );
}
