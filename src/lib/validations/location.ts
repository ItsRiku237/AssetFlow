import { z } from "zod";

function optionalTextMax(max: number) {
  return z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));
}

export const locationFormSchema = z
  .object({
    locationType: z.enum(["OFFICE", "REMOTE", "OTHER"]),
    building: optionalTextMax(120),
    floor: optionalTextMax(60),
    room: optionalTextMax(60),
    desk: optionalTextMax(60),
    description: optionalTextMax(500),
  })
  .superRefine((data, ctx) => {
    if (data.locationType === "REMOTE" || data.locationType === "OTHER") {
      if (!data.description) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "A location description is required for Remote and Other types.",
          path: ["description"],
        });
      }
    }
  });

export type LocationFormInput = z.infer<typeof locationFormSchema>;
