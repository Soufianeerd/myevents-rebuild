import { z } from 'zod';
import { printSnapshotSchema } from '@/core/designs/printing';
export const productKeys = [
  'invitation',
  'audio',
  'photo_video',
  'thank_you',
] as const;
export type ProductKey = (typeof productKeys)[number];
export const offerSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(150),
  products: z.array(z.enum(productKeys)).min(1),
  amount: z.number().int().min(50).max(1000000),
  currency: z.literal('eur'),
  active: z.boolean(),
  testOnly: z.literal(true),
  print: printSnapshotSchema.optional(),
});
export type Offer = z.infer<typeof offerSchema>;
// Sandbox seed amounts, explicitly not an approved production price list.
export const testOffers: Offer[] = [
  {
    id: 'invitation',
    name: 'Invitation digitale',
    products: ['invitation'],
    amount: 1499,
    currency: 'eur',
    active: true,
    testOnly: true,
  },
  {
    id: 'audio',
    name: 'Livre d’or audio',
    products: ['audio'],
    amount: 599,
    currency: 'eur',
    active: true,
    testOnly: true,
  },
  {
    id: 'photo-video',
    name: 'Photos et vidéos',
    products: ['photo_video'],
    amount: 799,
    currency: 'eur',
    active: true,
    testOnly: true,
  },
  {
    id: 'invitation-audio',
    name: 'Invitation + Audio',
    products: ['invitation', 'audio'],
    amount: 2098,
    currency: 'eur',
    active: true,
    testOnly: true,
  },
  {
    id: 'invitation-souvenirs',
    name: 'Invitation + Souvenirs',
    products: ['invitation', 'photo_video'],
    amount: 2298,
    currency: 'eur',
    active: true,
    testOnly: true,
  },
  {
    id: 'experience-complete',
    name: 'Expérience complète',
    products: ['invitation', 'audio', 'photo_video'],
    amount: 2897,
    currency: 'eur',
    active: true,
    testOnly: true,
  },
  {
    id: 'remerciements',
    name: 'Création de cartes de remerciement',
    products: ['thank_you'],
    amount: 599,
    currency: 'eur',
    active: true,
    testOnly: true,
  },
];
export type Order = {
  id: string;
  eventId: string;
  tenantId: string;
  offer: Offer;
  status: 'pending' | 'paid' | 'refunded';
  sessionId: string | null;
  createdAt: string;
  paidAt: string | null;
};
export function productsFromOrders(orders: Order[]): ProductKey[] {
  return [
    ...new Set(
      orders
        .filter((o) => o.status === 'paid')
        .flatMap((o) => o.offer.products),
    ),
  ];
}
export function assertProduct(products: ProductKey[], product: ProductKey) {
  if (!products.includes(product))
    throw new Error('Ce service doit être activé pour cet événement.');
}
