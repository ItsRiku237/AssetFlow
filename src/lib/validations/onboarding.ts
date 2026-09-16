import { z } from "zod";

export const onboardingSchema = z.object({
  employeeCode: z
    .string()
    .trim()
    .min(1, "Employee ID is required")
    .max(50, "Employee ID must be 50 characters or fewer"),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export type OnboardingActionState = {
  error: string | null;
  success: boolean;
};

export const onboardingInitialState: OnboardingActionState = {
  error: null,
  success: false,
};
