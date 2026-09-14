import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined));

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const assetFormSchema = z.object({
  assetTag: z.string().trim().min(1, "Asset tag is required").max(50),
  name: z.string().trim().min(1, "Name is required").max(120),
  type: z.string().trim().min(1, "Type is required").max(60),
  brand: optionalText,
  model: optionalText,
  serialNumber: optionalText,
  processor: optionalText,
  ram: optionalText,
  storage: optionalText,
  purchaseDate: optionalText.refine(
    (v) => v === undefined || DATE_PATTERN.test(v),
    "Enter a valid date"
  ),
  purchasePrice: optionalText.refine(
    (v) => v === undefined || !Number.isNaN(Number(v)),
    "Enter a valid number"
  ),
  warrantyExpiry: optionalText.refine(
    (v) => v === undefined || DATE_PATTERN.test(v),
    "Enter a valid date"
  ),
  imageUrl: optionalText.refine(
    (v) => v === undefined || /^https?:\/\//.test(v),
    "Enter a valid URL starting with http(s)://"
  ),
});

export type AssetFormInput = z.infer<typeof assetFormSchema>;
