import { z } from 'zod';
import { isTimeZone, toEventInstant } from './dates';

export const eventBasicsSchema = z
  .object({
    type: z.string().trim().min(1, 'Le type est requis.').max(80),
    name: z
      .string()
      .trim()
      .min(1, 'Le nom est requis.')
      .max(100, 'Le nom est trop long.'),
    startAt: z.string().min(1, 'La date est requise.').max(40),
    endAt: z.string().max(40).optional(),
    timezone: z
      .string()
      .max(100)
      .refine(isTimeZone, 'Fuseau horaire invalide.'),
    defaultLanguage: z.string().trim().min(2).max(35),
    estimatedGuestCount: z.number().int().nonnegative().optional(),
    primaryLocation: z.string().trim().max(500).optional(),
  })
  .transform((data, ctx) => {
    let startAt = data.startAt;
    let endAt = data.endAt || undefined;
    for (const field of ['startAt', 'endAt'] as const) {
      const value = data[field];
      if (!value) continue;
      try {
        const instant = toEventInstant(value, data.timezone);
        if (field === 'startAt') startAt = instant;
        else endAt = instant;
      } catch (error) {
        ctx.addIssue({
          code: 'custom',
          path: [field],
          message: error instanceof Error ? error.message : 'Date invalide.',
        });
      }
    }
    if (endAt && Date.parse(endAt) < Date.parse(startAt)) {
      ctx.addIssue({
        code: 'custom',
        path: ['endAt'],
        message: 'La fin doit être postérieure ou égale au début.',
      });
    }
    return { ...data, startAt, endAt };
  });
