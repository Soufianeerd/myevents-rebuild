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
export const catalogOfferSchema = z.discriminatedUnion('active', [
  offerSchema.extend({ active: z.literal(true) }),
  offerSchema.extend({
    active: z.literal(false),
    amount: offerSchema.shape.amount.nullable(),
  }),
]);
export type CatalogOffer = z.infer<typeof catalogOfferSchema>;

// Documented reference amounts, not an approved production price list.
// Missing prices stay unconfigured; see docs/product/COMMERCIAL-SOURCES.md.
export const testOffers: CatalogOffer[] = [
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
    amount: 1299,
    currency: 'eur',
    active: true,
    testOnly: true,
  },
  {
    id: 'photo-video',
    name: 'Photos et vidéos',
    products: ['photo_video'],
    amount: null,
    currency: 'eur',
    active: false,
    testOnly: true,
  },
  {
    id: 'audio-photo-video',
    name: 'Audio + Photos et vidéos',
    products: ['audio', 'photo_video'],
    amount: null,
    currency: 'eur',
    active: false,
    testOnly: true,
  },
  {
    id: 'invitation-audio',
    name: 'Invitation + Audio',
    products: ['invitation', 'audio'],
    amount: null,
    currency: 'eur',
    active: false,
    testOnly: true,
  },
  {
    id: 'invitation-souvenirs',
    name: 'Invitation + Souvenirs',
    products: ['invitation', 'photo_video'],
    amount: 2999,
    currency: 'eur',
    active: true,
    testOnly: true,
  },
  {
    id: 'experience-complete',
    name: 'Expérience complète',
    products: ['invitation', 'audio', 'photo_video'],
    amount: 3999,
    currency: 'eur',
    active: true,
    testOnly: true,
  },
  {
    id: 'remerciements',
    name: 'Création de cartes de remerciement',
    products: ['thank_you'],
    amount: 799,
    currency: 'eur',
    active: true,
    testOnly: true,
  },
];

/** An order must contain a configured, active price snapshot. */
export function parseCheckoutOffer(input: unknown): Offer {
  const result = offerSchema.safeParse(input);
  if (!result.success || !result.data.active)
    throw new Error('Cette offre n’est pas disponible au paiement.');
  return result.data;
}

export function getCheckoutOffer(
  id: string,
  catalog: readonly CatalogOffer[] = testOffers,
): Offer {
  return parseCheckoutOffer(catalog.find((offer) => offer.id === id));
}
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
