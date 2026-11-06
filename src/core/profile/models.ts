import { z } from 'zod';
export const profileNamesSchema = z
  .object({
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
  })
  .strict();
export type ProfileNames = z.infer<typeof profileNamesSchema>;
export const INCLUDED_STORAGE_BYTES = 3000000000;
export const ADDITIONAL_GB_CENTS = 149;
