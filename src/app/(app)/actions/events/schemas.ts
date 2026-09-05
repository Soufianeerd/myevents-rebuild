import { z } from 'zod';

export const createEventSchema = z.object({
  type: z.string().min(1, "Le type d'événement est requis"),
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom est trop long'),
  startAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Date invalide',
  }),
  timezone: z.string().min(1, 'Le fuseau horaire est requis'),
  defaultLanguage: z.string().min(2, 'La langue est requise'),
  estimatedGuestCount: z.number().int().positive().optional(),
  primaryLocation: z.string().optional(),
  endAt: z
    .string()
    .optional()
    .refine((date) => !date || !isNaN(Date.parse(date)), {
      message: 'Date de fin invalide',
    }),
});

export const updateEventSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom est requis')
    .max(100, 'Le nom est trop long')
    .optional(),
  startAt: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Date invalide',
    })
    .optional(),
  timezone: z.string().min(1, 'Le fuseau horaire est requis').optional(),
  defaultLanguage: z.string().min(2, 'La langue est requise').optional(),
  estimatedGuestCount: z.number().int().positive().optional(),
  primaryLocation: z.string().optional(),
  endAt: z
    .string()
    .optional()
    .refine((date) => !date || !isNaN(Date.parse(date)), {
      message: 'Date de fin invalide',
    }),
});

export type CreateEventSchema = z.infer<typeof createEventSchema>;
export type UpdateEventSchema = z.infer<typeof updateEventSchema>;
