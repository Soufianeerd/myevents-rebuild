import { expect, it } from 'vitest';
import {
  catalogOfferSchema,
  getCheckoutOffer,
  parseCheckoutOffer,
  testOffers,
} from '@/core/commerce/catalog';

it('keeps documented prices as test references and refuses undefined prices at checkout', () => {
  for (const offer of testOffers)
    expect(catalogOfferSchema.safeParse(offer).success).toBe(true);
  for (const [id, amount] of Object.entries({
    invitation: 1499,
    audio: 1299,
    'invitation-souvenirs': 2999,
    'experience-complete': 3999,
    remerciements: 799,
  })) {
    expect(getCheckoutOffer(id)).toMatchObject({ amount, testOnly: true });
  }
  for (const id of [
    'photo-video',
    'invitation-audio',
    'audio-photo-video',
    'unknown',
  ])
    expect(() => getCheckoutOffer(id)).toThrow();
  expect(
    testOffers.find((offer) => offer.id === 'audio-photo-video')?.products,
  ).toEqual(['audio', 'photo_video']);
  expect(() =>
    parseCheckoutOffer({ ...getCheckoutOffer('invitation'), active: false }),
  ).toThrow();
  expect(
    catalogOfferSchema.safeParse({
      ...getCheckoutOffer('invitation'),
      amount: null,
    }).success,
  ).toBe(false);
});
