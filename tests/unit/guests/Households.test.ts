import { it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import { guestSchema, guestBookSchema } from '@/core/guests/models';
import {
  assignCollection,
  renameCollection,
  guestCollections,
} from '@/core/guests/groupings';
import {
  reconcileResponse,
  validateResponseLinks,
} from '@/core/guests/reconciliation';
import {
  nonResponders,
  replyFor,
  withHouseholds,
} from '@/core/guests/responses';
const person = (name: string, household = '') =>
  guestSchema.parse({ id: randomUUID(), name, household, status: 'sent' });
const reply = (name: string) => ({
  id: randomUUID(),
  name,
  email: 'guest@example.invalid',
  presence: 'no' as const,
  answers: {},
  household: 'Maison Martin',
  consent: true as const,
});

it('groups members without conflating accents, counts actual replies and keeps manual statuses distinct', () => {
  const guests = [
    person('Léa', '  Maison   Martin'),
    person('Louis', 'maison martin'),
    person('Zoé', 'Maison Martín'),
  ];
  guests[1].status = 'yes';
  const groups = guestCollections(
    guests,
    [{ guestId: guests[0].id, presence: 'no' }],
    'household',
  );
  expect(groups).toHaveLength(2);
  expect(groups.find((group) => group.members.length === 2)).toMatchObject({
    yes: 0,
    no: 1,
    pending: 1,
  });
});
it('renames and dissolves households without changing contacts, replies or groups', () => {
  const guest = person('Léa');
  const responses = [
    { guestId: guest.id, presence: 'yes' as const, household: 'Maison Martin' },
  ];
  const original = withHouseholds({ guests: [guest] }, responses);
  const grouped = assignCollection(original, [guest.id], 'group', 'Famille');
  const renamed = renameCollection(
    grouped,
    'household',
    'Maison Martin',
    'Les Martin',
  );
  const cleared = assignCollection(renamed, [guest.id], 'household', '');
  expect(withHouseholds(cleared, responses).guests[0]).toMatchObject({
    household: '',
    householdAssigned: true,
    group: 'Famille',
    id: guest.id,
  });
  expect(responses[0].household).toBe('Maison Martin');
  expect(original.guests[0].household).toBe('Maison Martin');
  expect(() =>
    renameCollection(original, 'household', 'Maison Martin', '   '),
  ).toThrow();
  expect(() =>
    assignCollection(original, [randomUUID()], 'household', 'X'),
  ).toThrow();
});
it('requires explicit association and removes a linked refusal from reminders', () => {
  const guest = person('Léa'),
    response = reply('Léa');
  const book = { guests: [guest] };
  expect(nonResponders(book.guests, [response])).toHaveLength(1);
  const linked = reconcileResponse(
    book,
    [response],
    response.id,
    guest.id,
    randomUUID,
  );
  expect(linked.guests[0]).toMatchObject({
    responseId: response.id,
    household: 'Maison Martin',
  });
  expect(nonResponders(linked.guests, [response])).toEqual([]);
  expect(response).not.toHaveProperty('guestId');
  expect(() =>
    reconcileResponse(linked, [response], response.id, null, randomUUID),
  ).toThrow();
});
it('creates a contact from trusted response data and refuses cross-event, duplicate and personal associations', () => {
  const response = reply('Nora');
  const created = reconcileResponse(
    { guests: [] },
    [response],
    response.id,
    null,
    randomUUID,
  );
  expect(created.guests[0]).toMatchObject({
    name: 'Nora',
    email: response.email,
    responseId: response.id,
  });
  expect(() => validateResponseLinks(created, [])).toThrow();
  expect(() =>
    validateResponseLinks(created, [
      { ...response, guestId: created.guests[0].id },
    ]),
  ).toThrow();
  expect(() =>
    guestBookSchema.parse({
      guests: [...created.guests, { ...created.guests[0], id: randomUUID() }],
    }),
  ).toThrow();
  expect(() =>
    reconcileResponse(
      { guests: [] },
      [response],
      response.id,
      randomUUID(),
      randomUUID,
    ),
  ).toThrow();
});
it('uses the latest response after a linked general reply followed by a personal reply', () => {
  const guest = { ...person('Léa'), responseId: randomUUID() };
  const responses = [
    {
      id: guest.responseId,
      presence: 'no' as const,
      createdAt: '2026-09-30T12:00:00Z',
    },
    {
      guestId: guest.id,
      presence: 'yes' as const,
      createdAt: '2026-09-30T13:00:00Z',
    },
  ];
  expect(replyFor(guest, responses)?.presence).toBe('yes');
  expect(replyFor(guest, [...responses].reverse())?.presence).toBe('yes');
  expect(guestCollections([guest], responses, 'household')).toEqual([]);
});
