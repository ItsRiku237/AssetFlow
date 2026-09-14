import { z } from "zod";

export const assignAssetSchema = z.object({
  employeeId: z.string().trim().min(1, "Select an employee"),
});

export type AssignAssetInput = z.infer<typeof assignAssetSchema>;
