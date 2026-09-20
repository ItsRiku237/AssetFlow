import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined));

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const optionalSpec = z
  .string()
  .trim()
  .max(120, "Value must be 120 characters or fewer")
  .optional()
  .transform((v) => (v ? v : undefined));

export const assetFormSchema = z.object({
  assetTag: z.string().trim().min(1, "Asset tag is required").max(50),
  name: z.string().trim().min(1, "Name is required").max(120),
  type: z.string().trim().min(1, "Type is required").max(60),
  brand: optionalText,
  model: optionalText,
  serialNumber: optionalText,
  // Hardware spec fields: allow predefined values or any trimmed string
  // (custom "Other" entries). Length-capped; whitespace-trimmed.
  processor: optionalSpec,
  ram: optionalSpec,
  storage: optionalSpec,
  storageType: optionalSpec,
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
