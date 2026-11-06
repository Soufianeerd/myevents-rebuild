import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { isOperator, stageUpdateSchema } from '@/core/admin/models';
import { LocalOperatorRepository } from '@/providers/local/LocalOperatorRepository';
import { newThankYou } from '@/core/designs/models';

let dir: string;
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'myevents-operator-'));
});
afterEach(() => rm(dir, { recursive: true, force: true }));

it('recognises only explicitly listed operator e-mails', () => {
  expect(isOperator('Ops@Example.com', ' ops@example.com , b@x.fr')).toBe(true);
  expect(isOperator('other@example.com', 'ops@example.com')).toBe(false);
  expect(isOperator('ops@example.com', undefined)).toBe(false);
  expect(isOperator(null, 'ops@example.com')).toBe(false);
  expect(isOperator('ops@example.com', '')).toBe(false);
});

it('refuses to reset a request to its implicit first stage', () => {
  expect(
    stageUpdateSchema.safeParse({ requestId: randomUUID(), stage: 'requested' })
      .success,
  ).toBe(false);
});

it('summarises orders and records print stages per tenant locally', async () => {
  const eventId = randomUUID(),
    tenantId = randomUUID(),
    requestId = randomUUID(),
    now = new Date().toISOString();
  await writeFile(
    join(dir, 'events.json'),
    JSON.stringify({ [eventId]: { name: 'Mariage', tenantId } }),
  );
  await writeFile(join(dir, 'users.json'), JSON.stringify({ u1: {}, u2: {} }));
  await writeFile(
    join(dir, 'experience.json'),
    JSON.stringify({
      invitations: {},
      orders: [
        {
          id: randomUUID(),
          eventId,
          tenantId,
          offer: { name: 'Invitation digitale', amount: 1499 },
          status: 'paid',
          sessionId: 'cs_test_1',
          createdAt: now,
          paidAt: now,
        },
        {
          id: randomUUID(),
          eventId,
          tenantId,
          offer: { name: 'Livre d’or audio', amount: 1299 },
          status: 'pending',
          sessionId: null,
          createdAt: now,
          paidAt: null,
        },
      ],
    }),
  );
  await writeFile(
    join(dir, 'material-requests.json'),
    JSON.stringify([
      {
        id: requestId,
        revision: 1,
        material: 'Papier coton',
        finish: '',
        quantity: 50,
        notes: '',
        eventId,
        tenantId,
        document: newThankYou('Merci', randomUUID),
        status: 'requested',
        createdAt: now,
      },
    ]),
  );
  const repo = new LocalOperatorRepository(dir);
  const overview = await repo.overview();
  expect(overview.totals).toEqual({
    accounts: 2,
    events: 1,
    paidOrders: 1,
    revenueCents: 1499,
  });
  expect(overview.requests[0]).toMatchObject({
    eventName: 'Mariage',
    stage: 'requested',
  });
  await repo.setStage({ requestId, stage: 'quote_sent', note: '120 €' });
  expect((await repo.overview()).requests[0].stage).toBe('quote_sent');
  expect(await repo.latestStages(eventId, tenantId)).toEqual([
    expect.objectContaining({ stage: 'quote_sent', note: '120 €' }),
  ]);
  expect(await repo.latestStages(eventId, randomUUID())).toEqual([]);
  await expect(
    repo.setStage({ requestId: randomUUID(), stage: 'shipped', note: '' }),
  ).rejects.toThrow();
});
