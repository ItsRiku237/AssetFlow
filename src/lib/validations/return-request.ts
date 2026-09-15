import { z } from "zod";

export const createReturnRequestSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, "Please provide a reason for the return")
    .max(500, "Keep the reason under 500 characters"),
});

export type CreateReturnRequestInput = z.infer<typeof createReturnRequestSchema>;

export const approveReturnRequestSchema = z.object({
  nextStatus: z.enum(["AVAILABLE", "IN_REPAIR"]),
});

export type ApproveReturnRequestInput = z.infer<typeof approveReturnRequestSchema>;
