import { z } from "zod";

const employeeCodeSchema = z
  .string()
  .trim()
  .min(1, "Employee ID is required")
  .max(50, "Employee ID must be 50 characters or fewer");

const nameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(120, "Name must be 120 characters or fewer");

// Email is optional — an employee may be provisioned with only an ID
// and a name, before they have an account. When supplied it must be
// a valid address.
const optionalEmailSchema = z
  .string()
  .trim()
  .max(255)
  .optional()
  .transform((v) => (v ? v : undefined))
  .refine((v) => v === undefined || z.string().email().safeParse(v).success, {
    message: "Enter a valid email address",
  });

function optionalTextMax(max: number) {
  return z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));
}

export const employeeStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);

export const createEmployeeSchema = z.object({
  employeeCode: employeeCodeSchema,
  name: nameSchema,
  email: optionalEmailSchema,
  department: optionalTextMax(100),
  designation: optionalTextMax(100),
  phone: optionalTextMax(30),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

export const updateEmployeeSchema = z.object({
  employeeCode: employeeCodeSchema,
  name: nameSchema,
  email: optionalEmailSchema,
  department: optionalTextMax(100),
  designation: optionalTextMax(100),
  phone: optionalTextMax(30),
  status: employeeStatusSchema,
});

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
