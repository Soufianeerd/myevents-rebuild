import { describe, it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import {
  createInvitationDocument,
  applyTemplate,
} from '@/core/invitations/templates';
import {
  invitationDocumentSchema,
  validateRsvp,
} from '@/core/invitations/models';
import { productsFromOrders, testOffers } from '@/core/commerce/catalog';
const make = () =>
  createInvitationDocument(
    {
      name: 'Notre mariage',
      startAt: '2027-06-12T12:00:00Z',
      timezone: 'Europe/Paris',
    },
    randomUUID,
  );
const response = () => ({
  id: randomUUID(),
  name: 'Invité',
  email: 'guest@example.test',
  presence: 'yes',
  answers: {},
  consent: true,
});
describe('Invitation document and RSVP', () => {
  it('retains all content and questions when applying another template', () => {
    const doc = make();
    doc.fields = [
      {
        id: 'meal',
        type: 'choice',
        label: 'Menu',
        required: true,
        options: ['Végétarien', 'Classique'],
        description: '',
      },
    ];
    const next = applyTemplate(doc, 'garnet');
    expect(next.sections.map((s) => s.text)).toEqual(
      doc.sections.map((s) => s.text),
    );
    expect(next.fields).toEqual(doc.fields);
    expect(next.theme).toBe('garnet');
  });
  it('rejects unknown fields, invalid options and missing required answers', () => {
    const doc = make();
    doc.fields = [
      {
        id: 'meal',
        type: 'choice',
        label: 'Menu',
        required: true,
        options: ['Végétarien', 'Classique'],
        description: '',
      },
    ];
    expect(() => validateRsvp(doc, response(), new Date())).toThrow(
      'obligatoire',
    );
    expect(() =>
      validateRsvp(
        doc,
        { ...response(), answers: { meal: 'Hors liste' } },
        new Date(),
      ),
    ).toThrow('Vérifiez');
    expect(() =>
      validateRsvp(
        doc,
        { ...response(), answers: { meal: 'Classique', admin: true } },
        new Date(),
      ),
    ).toThrow('inconnu');
    expect(
      validateRsvp(
        doc,
        { ...response(), answers: { meal: 'Classique' } },
        new Date(),
      ).answers.meal,
    ).toBe('Classique');
  });
  it('validates presence, consent, deadlines and disabled responses', () => {
    const doc = make();
    expect(() =>
      validateRsvp(doc, { ...response(), consent: false }, new Date()),
    ).toThrow();
    expect(() =>
      validateRsvp(doc, { ...response(), presence: 'maybe' }, new Date()),
    ).toThrow();
    doc.deadline = '2020-01-01T00:00:00Z';
    expect(() => validateRsvp(doc, response(), new Date())).toThrow('dépassée');
    doc.deadline = null;
    doc.rsvpEnabled = false;
    expect(() => validateRsvp(doc, response(), new Date())).toThrow(
      'désactivées',
    );
  });
  it('does not accept arbitrary image URLs, duplicate blocks or CSS injection', () => {
    const doc = make();
    expect(
      invitationDocumentSchema.safeParse({
        ...doc,
        background: 'url(javascript:evil)',
      }).success,
    ).toBe(false);
    expect(
      invitationDocumentSchema.safeParse({
        ...doc,
        sections: [...doc.sections, doc.sections[0]],
      }).success,
    ).toBe(false);
    expect(
      invitationDocumentSchema.safeParse({
        ...doc,
        sections: [
          { ...doc.sections[0], image: 'https://tracker.invalid/image' },
        ],
      }).success,
    ).toBe(false);
  });
  it('grants products from paid orders only and composes packs without a separate engine', () => {
    const order = {
      id: '1',
      tenantId: '1',
      eventId: '1',
      sessionId: 'cs_test',
      createdAt: 'now',
      paidAt: null,
      offer: testOffers.find((o) => o.id === 'experience-complete')!,
    };
    expect(productsFromOrders([{ ...order, status: 'pending' }])).toEqual([]);
    expect(productsFromOrders([{ ...order, status: 'paid' }])).toEqual([
      'invitation',
      'audio',
      'photo_video',
    ]);
    expect(productsFromOrders([{ ...order, status: 'refunded' }])).toEqual([]);
  });
});
