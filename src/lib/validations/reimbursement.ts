import { z } from "zod";

/** Max amount: 100,000 — prevents obviously malformed figures. */
const MAX_AMOUNT = 100_000;

export const createReimbursementSchema = z.object({
  assetId: z.string().trim().min(1, "Asset is required"),
  maintenanceRecordId: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  amount: z
    .string()
    .trim()
    .min(1, "Amount is required")
    .refine((v) => !Number.isNaN(Number(v)), "Enter a valid amount")
    .refine((v) => Number(v) > 0, "Amount must be greater than zero")
    .refine(
      (v) => Number(v) <= MAX_AMOUNT,
      `Amount cannot exceed ${MAX_AMOUNT.toLocaleString()}`
    ),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(500, "Keep the description under 500 characters"),
  receiptReference: z
    .string()
    .trim()
    .max(200, "Keep the reference under 200 characters")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .refine((v) => {
      if (!v) return true;
      // Allow alphanumeric, spaces, hyphens, slashes, dots, and short URLs.
      // Reject anything with shell metacharacters or obvious injection patterns.
      return /^[\w\s\-./:#?=&()[\]@%+,]+$/.test(v);
    }, "Receipt reference contains invalid characters"),
});

export type CreateReimbursementInput = z.infer<typeof createReimbursementSchema>;

export const rejectReimbursementSchema = z.object({
  rejectionReason: z
    .string()
    .trim()
    .min(1, "Please provide a reason for rejection")
    .max(500, "Keep the reason under 500 characters"),
});

export type RejectReimbursementInput = z.infer<typeof rejectReimbursementSchema>;

export const reimbursementIdSchema = z.object({
  id: z.string().trim().min(1, "Reimbursement ID is required"),
});
