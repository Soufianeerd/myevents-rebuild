import { z } from 'zod';
import { eventBasicsSchema } from '@/core/events/validation';

export const createEventSchema = eventBasicsSchema;
export const eventIdSchema = z.string().uuid();
export type CreateEventSchema = z.infer<typeof createEventSchema>;
