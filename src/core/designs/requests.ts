import { z } from 'zod';
import { designSchema } from './models';

export const materialRequestInputSchema = z.object({
  id: z.uuid(),
  revision: z.number().int().positive(),
  material: z.string().trim().min(2).max(150),
  finish: z.string().trim().max(150).default(''),
  quantity: z.number().int().min(1).max(10000),
  notes: z.string().trim().max(2000).default(''),
});
export const materialRequestSchema = materialRequestInputSchema.extend({
  eventId: z.uuid(),
  tenantId: z.uuid(),
  document: designSchema,
  status: z.literal('requested'),
  createdAt: z.iso.datetime(),
});
export type MaterialRequest = z.infer<typeof materialRequestSchema>;
