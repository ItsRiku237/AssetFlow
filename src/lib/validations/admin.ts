import { z } from "zod";

export const inviteAdminSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name must be at most 100 characters.")
    .trim(),
  email: z
    .email("Enter a valid email address.")
    .max(254, "Email is too long.")
    .toLowerCase()
    .trim(),
});

export type InviteAdminInput = z.infer<typeof inviteAdminSchema>;

export interface InviteAdminActionState {
  error: string | null;
  fieldErrors?: Partial<Record<"name" | "email", string>>;
  success?: boolean;
}
