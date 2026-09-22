import { z } from 'zod';
const color = z.string().regex(/^#[a-fA-F0-9]{6}$/);
export const designElementSchema = z
  .object({
    id: z.uuid(),
    type: z.enum(['text', 'image', 'shape', 'qr']),
    x: z.number().min(0).max(95),
    y: z.number().min(0).max(95),
    width: z.number().min(5).max(100),
    height: z.number().min(5).max(100),
    text: z.string().max(2000).default(''),
    color: color.default('#641d2b'),
    background: color.default('#fffaf0'),
    font: z.enum(['serif', 'sans-serif', 'cursive']).default('serif'),
    fontSize: z.number().min(8).max(100).default(24),
    align: z.enum(['left', 'center', 'right']).default('center'),
    image: z
      .union([
        z.literal(''),
        z.uuid(),
        z.enum([
          '/images/editorial/jardin.jpg',
          '/images/editorial/reception.jpg',
          '/images/editorial/anniversaire.jpg',
        ]),
      ])
      .default(''),
    qr: z.enum(['audio', 'photo_video']).default('photo_video'),
    shape: z.enum(['rectangle', 'ellipse']).default('rectangle'),
  })
  .refine(
    (e) => e.x + e.width <= 100 && e.y + e.height <= 100,
    'L’élément doit rester dans les limites du support.',
  );
export const designSchema = z
  .object({
    schemaVersion: z.literal(1),
    product: z.enum(['thank_you', 'menu', 'place_card', 'welcome_sign']),
    name: z.string().trim().min(1).max(180),
    widthMm: z.number().int().min(50).max(1000),
    heightMm: z.number().int().min(50).max(1000),
    sides: z
      .array(
        z.object({
          name: z.enum(['recto', 'verso']),
          background: color,
          elements: z.array(designElementSchema).max(60),
        }),
      )
      .min(1)
      .max(2),
  })
  .refine(
    (d) => new Set(d.sides.map((s) => s.name)).size === d.sides.length,
    'Faces distinctes requises.',
  );
export type Design = z.infer<typeof designSchema>;
export type DesignElement = z.infer<typeof designElementSchema>;
export interface DesignRecord {
  eventId: string;
  tenantId: string;
  document: Design;
  revision: number;
  updatedAt: string;
}
export function newThankYou(name: string, id: () => string): Design {
  return designSchema.parse({
    schemaVersion: 1,
    product: 'thank_you',
    name: `Merci — ${name}`,
    widthMm: 105,
    heightMm: 148,
    sides: [
      {
        name: 'recto',
        background: '#faf5eb',
        elements: [
          {
            id: id(),
            type: 'text',
            x: 8,
            y: 15,
            width: 84,
            height: 20,
            text: 'Merci',
            fontSize: 64,
          },
          {
            id: id(),
            type: 'text',
            x: 10,
            y: 43,
            width: 80,
            height: 24,
            text: 'D’avoir fait partie de notre histoire.',
            fontSize: 24,
          },
          {
            id: id(),
            type: 'text',
            x: 10,
            y: 80,
            width: 80,
            height: 12,
            text: name,
            fontSize: 20,
          },
        ],
      },
      {
        name: 'verso',
        background: '#faf5eb',
        elements: [
          {
            id: id(),
            type: 'text',
            x: 10,
            y: 20,
            width: 80,
            height: 55,
            text: 'Vos sourires, votre présence, vos attentions…\nVous avez rendu cette journée inoubliable.\n\nMerci du fond du cœur !',
            fontSize: 24,
          },
        ],
      },
    ],
  });
}
export function validateDesignRights(
  document: Design,
  products: readonly string[],
  mediaIds: readonly string[],
) {
  for (const side of document.sides)
    for (const e of side.elements) {
      if (e.type === 'qr' && !products.includes(e.qr))
        throw new Error(
          'Ce QR nécessite l’option correspondante pour cet événement.',
        );
      if (
        e.type === 'image' &&
        e.image &&
        !e.image.startsWith('/') &&
        !mediaIds.includes(e.image)
      )
        throw new Error('Cette image n’appartient pas à votre événement.');
    }
}
