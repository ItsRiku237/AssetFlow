import { z } from "zod";

export const step1Schema = z.object({
  employeeCode: z
    .string()
    .trim()
    .min(1, "Employee ID is required")
    .max(50, "Employee ID is too long"),
  email: z
    .string()
    .trim()
    .min(1, "Company email is required")
    .email("Enter a valid email address")
    .max(255),
});

export const step3Schema = z
  .object({
    employeeCode: z.string().trim().min(1),
    name: z
      .string()
      .trim()
      .min(1, "Full name is required")
      .max(120, "Name must be 120 characters or fewer"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type Step1Input = z.infer<typeof step1Schema>;
export type Step3Input = z.infer<typeof step3Schema>;

/** Shared state shape carried across all four activation steps. */
export interface ActivationActionState {
  step: 1 | 2 | 3 | 4;
  error: string | null;
  /** Carried forward from step 1 → 2 → 3 (never trusted server-side alone). */
  employeeCode?: string;
  /** The verified email, carried to step 2 so resend can re-submit it. */
  email?: string;
  /** Shown in step 2 UI: "Code sent to em***@company.com" */
  maskedEmail?: string;
  /** Field-level validation errors for step 3 form. */
  fieldErrors?: Record<string, string>;
}
