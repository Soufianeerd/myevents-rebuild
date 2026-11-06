import { beforeEach, afterEach, it, expect } from 'vitest';
import { mkdtemp, rm, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { LocalEventRepository } from '@/providers/local/LocalEventRepository';
import { LocalExperienceRepository } from '@/providers/local/LocalExperienceRepository';
import { LocalDesignRepository } from '@/providers/local/LocalDesignRepository';
import { LocalMediaRepository } from '@/providers/local/LocalMediaRepository';
import { newThankYou } from '@/core/designs/models';
import { getCheckoutOffer } from '@/core/commerce/catalog';
import type { Event } from '@/core/events/models';
let directory: string;
const event: Event = {
  id: randomUUID() as never,
  tenantId: randomUUID() as never,
  createdBy: randomUUID() as never,
  workspaceId: randomUUID() as never,
  name: 'Anniversaire',
  type: 'birthday',
  startAt: '2027-07-04T18:00:00.000Z',
  timezone: 'Europe/Paris',
  defaultLanguage: 'fr',
  lifecycleStatus: 'draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'myevents-product-'));
  await new LocalEventRepository(directory).create(event);
});
afterEach(() => rm(directory, { recursive: true, force: true }));
it('runs standalone audio with no invitation and revokes legacy public audio settings', async () => {
  const experience = new LocalExperienceRepository(directory),
    media = new LocalMediaRepository(directory);
  await experience.createOrder({
    id: randomUUID(),
    eventId: event.id,
    tenantId: event.tenantId,
    offer: getCheckoutOffer('audio'),
    status: 'paid',
    sessionId: null,
    createdAt: new Date().toISOString(),
    paidAt: new Date().toISOString(),
  });
  expect(await experience.get(event.id, event.tenantId)).toBeNull();
  await media.configure(event.id, event.tenantId, 'audio', 'a'.repeat(64), {
    enabled: true,
    collaborative: false,
    allowDownload: false,
    availableAt: '2020-01-01T00:00:00.000Z',
  });
  const id = randomUUID(),
    input = {
      name: 'Message.wav',
      mime: 'audio/wav' as const,
      size: 100,
      author: 'Invité',
      consent: true as const,
    };
  await media.reserve('a'.repeat(64), id, 'b'.repeat(64), input);
  await media.complete(
    id,
    'b'.repeat(64),
    100,
    'audio/wav',
    `${event.tenantId}/${event.id}/${randomUUID()}`,
  );
  const file = join(directory, 'media.json'),
    saved = JSON.parse(await readFile(file, 'utf8'));
  saved.spaces[0].collaborative = true;
  saved.spaces[0].allowDownload = true;
  await writeFile(file, JSON.stringify(saved));
  expect(await media.publicSpace('a'.repeat(64))).toMatchObject({
    collaborative: false,
    allowDownload: false,
  });
  expect(await media.shared('a'.repeat(64))).toEqual([]);
  expect(await media.list(event.id, event.tenantId)).toHaveLength(1);
  expect((await media.usage(event.tenantId)).limit).toBe(3000000000);
  await expect(
    media.configure(event.id, event.tenantId, 'photo_video', 'c'.repeat(64), {
      enabled: true,
      collaborative: false,
      allowDownload: false,
      availableAt: '2020-01-01T00:00:00.000Z',
    }),
  ).rejects.toThrow();
});
it('stores an independent card and immutable material request without an invitation or print order', async () => {
  const repo = new LocalDesignRepository(directory);
  const document = newThankYou('Samira', randomUUID);
  const record = await repo.save(event.id, event.tenantId, document, 0);
  const request = {
    id: randomUUID(),
    eventId: event.id,
    tenantId: event.tenantId,
    document,
    revision: record.revision,
    material: 'Plexiglas',
    finish: '',
    quantity: 25,
    notes: '',
    status: 'requested' as const,
    createdAt: new Date().toISOString(),
  };
  await repo.requestMaterial(request);
  await repo.requestMaterial(request);
  expect(await repo.requests(event.id, event.tenantId)).toHaveLength(1);
  expect(
    await new LocalExperienceRepository(directory).orders(
      event.id,
      event.tenantId,
    ),
  ).toEqual([]);
  await expect(repo.requests(event.id, randomUUID())).rejects.toThrow();
  await expect(
    repo.requestMaterial({ ...request, quantity: 50 }),
  ).rejects.toThrow();
});
