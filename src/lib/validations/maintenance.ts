import { z } from "zod";

function optionalTextMax(max: number) {
  return z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));
}

const optionalCost = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined))
  .refine(
    (v) => v === undefined || (!Number.isNaN(Number(v)) && Number(v) >= 0),
    "Enter a valid non-negative amount"
  );

export const createMaintenanceRecordSchema = z.object({
  issue: z
    .string()
    .trim()
    .min(1, "Describe the issue")
    .max(200, "Keep the issue under 200 characters"),
  description: optionalTextMax(1000),
  vendor: optionalTextMax(120),
  cost: optionalCost,
});

export type CreateMaintenanceRecordInput = z.infer<
  typeof createMaintenanceRecordSchema
>;

export const updateMaintenanceRecordSchema = z.object({
  issue: z
    .string()
    .trim()
    .min(1, "Describe the issue")
    .max(200, "Keep the issue under 200 characters"),
  description: optionalTextMax(1000),
  vendor: optionalTextMax(120),
  cost: optionalCost,
});

export type UpdateMaintenanceRecordInput = z.infer<
  typeof updateMaintenanceRecordSchema
>;

export const completeMaintenanceRecordSchema = z.object({
  resolution: z
    .string()
    .trim()
    .min(1, "Describe how the repair was resolved")
    .max(1000, "Keep the resolution under 1000 characters"),
  cost: optionalCost,
});

export type CompleteMaintenanceRecordInput = z.infer<
  typeof completeMaintenanceRecordSchema
>;
