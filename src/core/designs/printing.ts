import { z } from 'zod';
import { designSchema } from './models';
export const materialSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(100),
  unitAmount: z.number().int().min(1).max(100000),
  minimum: z.number().int().min(1).max(10000),
  maximum: z.number().int().min(1).max(10000),
  formats: z.array(z.string().regex(/^\d+x\d+$/)).min(1),
  finishes: z.array(z.enum(['mat', 'satin'])).min(1),
  deliveryAmount: z.number().int().min(0).max(100000),
  leadDays: z.number().int().min(1).max(365),
  active: z.boolean(),
  testOnly: z.literal(true),
});
export type PrintMaterial = z.infer<typeof materialSchema>;
export const testMaterials: PrintMaterial[] = [
  {
    id: 'papier',
    name: 'Papier — tarif de test',
    unitAmount: 80,
    minimum: 1,
    maximum: 1000,
    formats: ['105x148', '148x105', '140x140'],
    finishes: ['mat'],
    deliveryAmount: 690,
    leadDays: 5,
    active: true,
    testOnly: true,
  },
  {
    id: 'carton',
    name: 'Carte cartonnée — tarif de test',
    unitAmount: 120,
    minimum: 1,
    maximum: 1000,
    formats: ['105x148', '148x105', '140x140'],
    finishes: ['mat', 'satin'],
    deliveryAmount: 690,
    leadDays: 5,
    active: true,
    testOnly: true,
  },
];
export const printRequestSchema = z.object({
  materialId: z.string().max(100),
  finish: z.enum(['mat', 'satin']),
  quantity: z.number().int().min(1).max(10000),
  approved: z.literal(true),
  address: z.object({
    name: z.string().trim().min(2).max(150),
    line1: z.string().trim().min(3).max(200),
    line2: z.string().trim().max(200).default(''),
    postalCode: z.string().trim().min(2).max(20),
    city: z.string().trim().min(2).max(100),
    country: z.enum([
      'FR',
      'BE',
      'CH',
      'LU',
      'DE',
      'ES',
      'IT',
      'NL',
      'PT',
      'GB',
      'MA',
    ]),
  }),
});
export const printSnapshotSchema = z.object({
  document: designSchema,
  revision: z.number().int().positive(),
  material: materialSchema,
  request: printRequestSchema,
  subtotal: z.number().int().positive(),
  delivery: z.number().int().nonnegative(),
  total: z.number().int().positive(),
});
export function quotePrint(
  document: z.infer<typeof designSchema>,
  material: PrintMaterial,
  request: z.infer<typeof printRequestSchema>,
) {
  if (
    !material.active ||
    material.id !== request.materialId ||
    !material.formats.includes(`${document.widthMm}x${document.heightMm}`) ||
    !material.finishes.includes(request.finish) ||
    request.quantity < material.minimum ||
    request.quantity > material.maximum
  )
    throw new Error('Cette configuration d’impression n’est pas disponible.');
  const subtotal = material.unitAmount * request.quantity;
  return {
    subtotal,
    delivery: material.deliveryAmount,
    total: subtotal + material.deliveryAmount,
  };
}
