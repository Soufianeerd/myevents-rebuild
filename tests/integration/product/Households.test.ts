import { beforeEach, afterEach, it, expect } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { LocalEventRepository } from '@/providers/local/LocalEventRepository';
import { LocalExperienceRepository } from '@/providers/local/LocalExperienceRepository';
import { LocalGuestRepository } from '@/providers/local/LocalGuestRepository';
import { createInvitationDocument } from '@/core/invitations/templates';
import { guestSchema } from '@/core/guests/models';
import { assignCollection, guestCollections } from '@/core/guests/groupings';
import { reconcileResponse } from '@/core/guests/reconciliation';
import {
  nonResponders,
  replyFor,
  withHouseholds,
} from '@/core/guests/responses';
import type { Event } from '@/core/events/models';

let directory: string;
const hash = () => createHash('sha256').update(randomUUID()).digest('hex');
const now = () => new Date().toISOString();

async function publishedEvent(tenantId: string = randomUUID()) {
  const event: Event = {
    id: randomUUID() as never,
    tenantId: tenantId as never,
    workspaceId: randomUUID() as never,
    createdBy: randomUUID() as never,
    type: 'birthday',
    name: 'Anniversaire de Samira',
    startAt: '2027-07-04T18:00:00.000Z',
    timezone: 'Europe/Paris',
    defaultLanguage: 'fr',
    lifecycleStatus: 'draft',
    createdAt: now(),
    updatedAt: now(),
  };
  await new LocalEventRepository(directory).create(event);
  const experience = new LocalExperienceRepository(directory);
  const document = createInvitationDocument(event, randomUUID);
  const fieldId = 'household';
  document.fields = [
    {
      id: fieldId,
      label: 'Votre foyer',
      description: '',
      type: 'text',
      required: false,
      options: [],
      binding: 'household',
    },
  ];
  const record = await experience.save(
    event.id,
    event.tenantId,
    document,
    0,
    now(),
  );
  await experience.activatePreview(event.id, event.tenantId);
  const tokenHash = hash();
  await experience.publish(
    event.id,
    event.tenantId,
    record.revision,
    tokenHash,
    now(),
  );
  const response = {
    id: randomUUID(),
    name: 'Samira Martin',
    email: 'samira@example.invalid',
    presence: 'no' as const,
    answers: { [fieldId]: 'Famille Martin' },
    consent: true as const,
  };
  await experience.respond(tokenHash, response, record.revision, now());
  return {
    event,
    experience,
    fieldId,
    tokenHash,
    response,
    revision: record.revision,
  };
}

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'myevents-households-'));
});
afterEach(() => rm(directory, { recursive: true, force: true }));

it('persists a general RSVP association, explicit household removal and contact deletion without changing the response', async () => {
  const { event, experience, response } = await publishedEvent();
  const guests = new LocalGuestRepository(directory);
  const contact = guestSchema.parse({
    id: randomUUID(),
    name: 'Samira',
    email: response.email,
    status: 'sent',
  });
  let record = await guests.save(
    event.id,
    event.tenantId,
    { guests: [contact] },
    0,
  );
  const originalResponses = await experience.responses(
    event.id,
    event.tenantId,
  );
  const linked = reconcileResponse(
    record.document,
    originalResponses,
    response.id,
    contact.id,
    randomUUID,
  );
  record = await guests.save(event.id, event.tenantId, linked, record.revision);
  const reloaded = (await new LocalGuestRepository(directory).get(
    event.id,
    event.tenantId,
  ))!;
  expect(reloaded.document.guests[0]).toMatchObject({
    id: contact.id,
    name: 'Samira',
    responseId: response.id,
    household: 'Famille Martin',
  });
  expect(
    replyFor(reloaded.document.guests[0], originalResponses)?.presence,
  ).toBe('no');
  expect(nonResponders(reloaded.document.guests, originalResponses)).toEqual(
    [],
  );
  expect(
    guestCollections(reloaded.document.guests, originalResponses, 'household'),
  ).toMatchObject([{ name: 'Famille Martin', yes: 0, no: 1, pending: 0 }]);

  const detached = assignCollection(
    record.document,
    [contact.id],
    'household',
    '',
  );
  record = await guests.save(
    event.id,
    event.tenantId,
    detached,
    record.revision,
  );
  await expect(
    guests.save(event.id, event.tenantId, linked, reloaded.revision),
  ).rejects.toThrow(/modifiée ailleurs/);
  const persisted = (await guests.get(event.id, event.tenantId))!;
  expect(
    withHouseholds(persisted.document, originalResponses).guests[0],
  ).toMatchObject({
    household: '',
    householdAssigned: true,
    responseId: response.id,
  });
  await guests.save(event.id, event.tenantId, { guests: [] }, record.revision);
  expect((await guests.get(event.id, event.tenantId))?.document.guests).toEqual(
    [],
  );
  expect(await experience.responses(event.id, event.tenantId)).toEqual(
    originalResponses,
  );
});

it('rejects foreign-event or duplicate response associations and other-tenant access before altering the guest book', async () => {
  const own = await publishedEvent();
  const foreign = await publishedEvent(own.event.tenantId);
  const guests = new LocalGuestRepository(directory);
  const replies = await own.experience.responses(
    own.event.id,
    own.event.tenantId,
  );
  const linked = reconcileResponse(
    { guests: [] },
    replies,
    own.response.id,
    null,
    randomUUID,
  );
  const record = await guests.save(own.event.id, own.event.tenantId, linked, 0);
  const contact = record.document.guests[0];
  expect(contact).toMatchObject({
    name: own.response.name,
    email: own.response.email,
    responseId: own.response.id,
  });
  for (const document of [
    { guests: [{ ...contact, responseId: foreign.response.id }] },
    { guests: [contact, { ...contact, id: randomUUID() }] },
  ]) {
    await expect(
      guests.save(own.event.id, own.event.tenantId, document, record.revision),
    ).rejects.toThrow();
  }
  const otherTenant = randomUUID();
  await expect(guests.get(own.event.id, otherTenant)).rejects.toThrow();
  await expect(
    guests.save(own.event.id, otherTenant, { guests: [] }, record.revision),
  ).rejects.toThrow();
  await expect(
    own.experience.responses(own.event.id, otherTenant),
  ).rejects.toThrow();
  expect(await guests.get(own.event.id, own.event.tenantId)).toEqual(record);
});

it('cannot reassign a personal RSVP to another contact, including after deleting its original contact', async () => {
  const { event, experience, fieldId, revision } = await publishedEvent();
  const guests = new LocalGuestRepository(directory);
  const contact = guestSchema.parse({
    id: randomUUID(),
    name: 'Alice',
    email: 'alice@example.invalid',
    status: 'sent',
  });
  const another = guestSchema.parse({ id: randomUUID(), name: 'Bob' });
  let record = await guests.save(
    event.id,
    event.tenantId,
    { guests: [contact, another] },
    0,
  );
  const tokenHash = hash();
  await experience.issueGuestLink(
    event.id,
    event.tenantId,
    contact.id,
    tokenHash,
  );
  const response = {
    id: randomUUID(),
    guestId: contact.id,
    name: contact.name,
    email: contact.email,
    presence: 'yes' as const,
    answers: { [fieldId]: 'Foyer Alice' },
    consent: true as const,
  };
  await experience.respond(tokenHash, response, revision, now());
  await expect(
    guests.save(
      event.id,
      event.tenantId,
      {
        guests: [contact, { ...another, responseId: response.id }],
      },
      record.revision,
    ),
  ).rejects.toThrow(/ne peut pas être rattachée/);
  record = await guests.save(
    event.id,
    event.tenantId,
    { guests: [another] },
    record.revision,
  );
  await expect(
    guests.save(
      event.id,
      event.tenantId,
      {
        guests: [{ ...another, responseId: response.id }],
      },
      record.revision,
    ),
  ).rejects.toThrow(/ne peut pas être rattachée/);
  expect(
    (await experience.responses(event.id, event.tenantId)).find(
      (row) => row.id === response.id,
    ),
  ).toMatchObject({
    guestId: contact.id,
    household: 'Foyer Alice',
    presence: 'yes',
  });
  expect(await experience.getPublic(tokenHash)).toBeNull();
});
