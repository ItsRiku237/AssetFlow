import { z } from "zod";

const nameSchema = z
  .string({ message: "Name is required" })
  .trim()
  .min(1, "Name is required")
  .max(120, "Name must be 120 characters or fewer");

const optionalPhoneSchema = z
  .preprocess((val) => {
    if (typeof val === "string") {
      const trimmed = val.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    }
    return undefined;
  }, z.string().max(30, "Phone number must be 30 characters or fewer").optional());

export const updateProfileSchema = z.object({
  name: nameSchema,
  phone: optionalPhoneSchema,
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
