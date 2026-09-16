import { z } from "zod";

export const registerEmployeeSchema = z
  .object({
    employeeCode: z
      .string()
      .trim()
      .min(1, "Employee ID is required")
      .max(50, "Employee ID must be 50 characters or fewer"),
    email: z.email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must be 100 characters or fewer"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    name: z
      .string()
      .trim()
      .min(1, "Full name is required")
      .max(120, "Name must be 120 characters or fewer"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterEmployeeInput = z.infer<typeof registerEmployeeSchema>;

export type RegisterActionState = {
  error: string | null;
  fieldErrors?: Partial<Record<string, string>>;
  success: boolean;
};

export const registerInitialState: RegisterActionState = {
  error: null,
  success: false,
};
