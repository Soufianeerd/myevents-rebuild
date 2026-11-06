import { it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import { guestSchema } from '@/core/guests/models';
import {
  nonResponders,
  responseColumns,
  withHouseholds,
} from '@/core/guests/responses';
import { createInvitationDocument } from '@/core/invitations/templates';
import { validateRsvp } from '@/core/invitations/models';
it('excludes refusals, positive replies and not-yet-invited contacts from reminders', () => {
  const guests = ['sent', 'yes', 'no', 'not_invited', 'pending'].map((status) =>
    guestSchema.parse({ id: randomUUID(), name: status, status }),
  );
  expect(
    nonResponders(guests, [{ guestId: guests[0].id, presence: 'no' }]).map(
      (guest) => guest.status,
    ),
  ).toEqual(['pending']);
});
it('binds the configured household and retains labels for deleted form fields', () => {
  const document = createInvitationDocument(
    {
      name: 'Henné',
      startAt: '2027-06-01T12:00:00.000Z',
      timezone: 'Europe/Paris',
    },
    randomUUID,
  );
  document.fields = [
    {
      id: 'family',
      label: 'Votre foyer',
      binding: 'household',
      type: 'text',
      required: false,
      description: '',
      options: [],
    },
  ];
  const response = validateRsvp(
    document,
    {
      id: randomUUID(),
      name: 'Léa',
      email: 'lea@example.invalid',
      presence: 'yes',
      answers: { family: 'Maison Léa' },
      household: 'Injected',
      consent: true,
    },
    new Date(),
  );
  expect(response.household).toBe('Maison Léa');
  expect(responseColumns([], [response])).toEqual([
    { id: 'family', label: 'Votre foyer' },
  ]);
  const guest = guestSchema.parse({ id: randomUUID(), name: 'Léa' });
  expect(
    withHouseholds({ guests: [guest] }, [{ ...response, guestId: guest.id }])
      .guests[0].household,
  ).toBe('Maison Léa');
  expect(
    withHouseholds({ guests: [guest] }, [response]).guests[0].household,
  ).toBe('');
});
