import { z } from "zod";

export const createAssetRequestSchema = z.object({
  reason: z
    .string()
    .trim()
    .max(500, "Keep the reason under 500 characters")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
});

export type CreateAssetRequestInput = z.infer<typeof createAssetRequestSchema>;

export const reviewAssetRequestSchema = z.object({
  reviewNote: z
    .string()
    .trim()
    .max(500, "Keep the note under 500 characters")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
});

export type ReviewAssetRequestInput = z.infer<typeof reviewAssetRequestSchema>;
