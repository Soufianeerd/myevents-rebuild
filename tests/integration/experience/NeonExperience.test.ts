import { PGlite } from '@electric-sql/pglite';
import { PgDialect } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { randomUUID, createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { beforeAll, afterAll, it, expect } from 'vitest';
import { NeonDesignRepository } from '@/providers/neon/NeonDesignRepository';
import { newThankYou } from '@/core/designs/models';
import { NeonMediaRepository } from '@/providers/neon/NeonMediaRepository';
import { NeonExperienceRepository } from '@/providers/neon/NeonExperienceRepository';
import { createInvitationDocument } from '@/core/invitations/templates';
import { testOffers, type Order } from '@/core/commerce/catalog';
const db = new PGlite(),
  dialect = new PgDialect();
const owner = randomUUID(),
  other = randomUUID(),
  session = randomUUID(),
  otherSession = randomUUID(),
  eventId = randomUUID(),
  secret = 'test-fulfillment-secret-with-at-least-32-characters';
let tenant: string;
const scoped = (user: string, sessionId: string) => ({
  query: (statement: Parameters<typeof dialect.sqlToQuery>[0]) =>
    db.transaction(async (tx) => {
      await tx.exec('SET LOCAL ROLE myevents_app');
      await tx.query(
        "SELECT set_config('myevents.neon_user_id',$1,true),set_config('myevents.neon_session_id',$2,true)",
        [user, sessionId],
      );
      const q = dialect.sqlToQuery(statement);
      return (await tx.query<Record<string, unknown>>(q.sql, q.params)).rows;
    }),
});
const repo = new NeonExperienceRepository(scoped(owner, session)),
  stranger = new NeonExperienceRepository(scoped(other, otherSession)),
  anonymous = new NeonExperienceRepository(scoped('', ''));
beforeAll(async () => {
  await db.exec(
    `CREATE SCHEMA neon_auth;CREATE TABLE neon_auth."user"(id uuid PRIMARY KEY,name text,email text,"emailVerified" boolean,banned boolean,"banExpires" timestamptz,"createdAt" timestamptz DEFAULT now());CREATE TABLE neon_auth.session(id uuid PRIMARY KEY,"userId" uuid,"createdAt" timestamptz,"expiresAt" timestamptz);CREATE TABLE neon_auth.account("userId" uuid,"providerId" text,"updatedAt" timestamptz);`,
  );
  for (const [id, sid] of [
    [owner, session],
    [other, otherSession],
  ]) {
    await db.query(
      'INSERT INTO neon_auth."user"(id,name,email,"emailVerified") VALUES($1,\'Owner\',$2,true)',
      [id, `${id}@example.invalid`],
    );
    await db.query(
      "INSERT INTO neon_auth.session VALUES($1,$2,now(),now()+interval '1 hour')",
      [sid, id],
    );
  }
  await db.exec(await readFile('neon/migrations/0001_application.sql', 'utf8'));
  await db.exec(await readFile('neon/migrations/0003_experience.sql', 'utf8'));
  await db.exec(await readFile('neon/migrations/0004_media.sql', 'utf8'));
  await db.exec(await readFile('neon/migrations/0005_designs.sql', 'utf8'));
  await db.exec(
    await readFile('neon/migrations/0006_business_preview.sql', 'utf8'),
  );
  const profile = (
    await scoped(owner, session).query(
      sql`SELECT * FROM myevents.ensure_identity()`,
    )
  )[0];
  tenant = String(profile.tenant_id);
  await scoped(other, otherSession).query(
    sql`SELECT * FROM myevents.ensure_identity()`,
  );
  const workspace = (
    await scoped(owner, session).query(sql`SELECT id FROM myevents.workspaces`)
  )[0];
  await scoped(owner, session).query(
    sql`INSERT INTO myevents.events(id,workspace_id,tenant_id,created_by,type,name,start_at,timezone,default_language) VALUES(${eventId},${String(workspace.id)},${tenant},${owner},'wedding','Test','2027-06-12T12:00Z','Europe/Paris','fr')`,
  );
  await db.query("INSERT INTO myevents.service_secrets VALUES('payments',$1)", [
    createHash('sha256').update(secret).digest('hex'),
  ]);
}, 120000);
afterAll(() => db.close());
it('saves drafts with optimistic concurrency and prevents cross-tenant reads and writes', async () => {
  const doc = createInvitationDocument(
    {
      name: 'Private draft',
      startAt: '2027-06-12T12:00Z',
      timezone: 'Europe/Paris',
    },
    randomUUID,
  );
  const first = await repo.save(
    eventId,
    tenant,
    doc,
    0,
    new Date().toISOString(),
  );
  expect(first.revision).toBe(1);
  expect(await stranger.get(eventId, tenant)).toBeNull();
  await expect(
    stranger.save(eventId, tenant, doc, 1, new Date().toISOString()),
  ).rejects.toThrow();
  await expect(
    repo.save(eventId, tenant, doc, 0, new Date().toISOString()),
  ).rejects.toThrow();
  expect(
    (
      await repo.save(
        eventId,
        tenant,
        { ...doc, title: 'Edited' },
        1,
        new Date().toISOString(),
      )
    ).revision,
  ).toBe(2);
});
it('requires verified payment, is idempotent and keeps published data isolated from draft', async () => {
  const hash = 'a'.repeat(64);
  await expect(
    repo.publish(eventId, tenant, 2, hash, new Date().toISOString()),
  ).rejects.toThrow();
  const order: Order = {
    id: randomUUID(),
    eventId,
    tenantId: tenant,
    offer: testOffers[0],
    status: 'pending',
    sessionId: null,
    createdAt: new Date().toISOString(),
    paidAt: null,
  };
  await repo.createOrder(order);
  await repo.attachSession(order.id, tenant, 'cs_test_sample');
  await expect(
    anonymous.fulfill(
      order.id,
      'cs_test_sample',
      1499,
      new Date().toISOString(),
      'wrong',
    ),
  ).rejects.toThrow();
  await expect(
    anonymous.fulfill(
      order.id,
      'cs_test_sample',
      1,
      new Date().toISOString(),
      secret,
    ),
  ).rejects.toThrow();
  await anonymous.fulfill(
    order.id,
    'cs_test_sample',
    1499,
    new Date().toISOString(),
    secret,
  );
  await anonymous.fulfill(
    order.id,
    'cs_test_sample',
    1499,
    new Date().toISOString(),
    secret,
  );
  await repo.publish(eventId, tenant, 2, hash, new Date().toISOString());
  expect((await anonymous.getPublic(hash))?.document.title).toBe('Edited');
  const record = (await repo.get(eventId, tenant))!;
  await repo.save(
    eventId,
    tenant,
    { ...record.draft, title: 'Unpublished change' },
    2,
    new Date().toISOString(),
  );
  expect((await anonymous.getPublic(hash))?.document.title).toBe('Edited');
  expect((await anonymous.getPublic(hash))?.revision).toBe(2);
});
it('stores responses once, keeps guest data private and rejects suspended or stale links', async () => {
  const response = {
    id: randomUUID(),
    name: 'Guest',
    email: 'guest@example.invalid',
    presence: 'no' as const,
    answers: {},
    consent: true as const,
  };
  await expect(
    anonymous.respond('a'.repeat(64), response, 1, new Date().toISOString()),
  ).rejects.toThrow();
  await anonymous.respond(
    'a'.repeat(64),
    response,
    2,
    new Date().toISOString(),
  );
  await anonymous.respond(
    'a'.repeat(64),
    response,
    2,
    new Date().toISOString(),
  );
  expect((await repo.responses(eventId, tenant)).length).toBe(1);
  expect(await stranger.responses(eventId, tenant)).toEqual([]);
  expect(await anonymous.responses(eventId, tenant)).toEqual([]);
  await repo.suspend(eventId, tenant);
  expect(await anonymous.getPublic('a'.repeat(64))).toBeNull();
  await expect(
    anonymous.respond(
      'a'.repeat(64),
      { ...response, id: randomUUID() },
      2,
      new Date().toISOString(),
    ),
  ).rejects.toThrow();
});

it('enforces purchased media, isolation, upload completion and gallery opening', async () => {
  const media = new NeonMediaRepository(scoped(owner, session));
  const guest = new NeonMediaRepository(scoped('', ''));
  const strangerMedia = new NeonMediaRepository(scoped(other, otherSession));
  const hash = 'b'.repeat(64),
    config = {
      enabled: true,
      collaborative: false,
      availableAt: '2020-01-01T00:00:00.000Z',
      allowDownload: false,
    };
  await expect(
    media.configure(eventId, tenant, 'photo_video', hash, config),
  ).rejects.toThrow();
  const offer = testOffers.find((o) => o.products.includes('photo_video'))!;
  const id = randomUUID();
  await repo.createOrder({
    id,
    eventId,
    tenantId: tenant,
    offer,
    status: 'pending',
    sessionId: null,
    createdAt: new Date().toISOString(),
    paidAt: null,
  });
  await repo.attachSession(id, tenant, 'cs_test_media');
  await anonymous.fulfill(
    id,
    'cs_test_media',
    offer.amount,
    new Date().toISOString(),
    secret,
  );
  await media.configure(eventId, tenant, 'photo_video', hash, config);
  expect((await guest.publicSpace(hash))?.kind).toBe('photo_video');
  await expect(
    strangerMedia.configure(eventId, tenant, 'photo_video', hash, config),
  ).rejects.toThrow();
  const uploadId = randomUUID(),
    uploadHash = 'c'.repeat(64),
    input = {
      name: 'Photo.png',
      author: 'Guest',
      mime: 'image/png' as const,
      size: 1024,
      consent: true as const,
    };
  await guest.reserve(hash, uploadId, uploadHash, input);
  expect(await guest.pending(uploadId, 'd'.repeat(64))).toBeNull();
  await expect(
    guest.complete(
      uploadId,
      uploadHash,
      100,
      'image/png',
      `${tenant}/${eventId}/${randomUUID()}`,
    ),
  ).rejects.toThrow();
  await guest.complete(
    uploadId,
    uploadHash,
    1024,
    'image/png',
    `${tenant}/${eventId}/${randomUUID()}`,
  );
  await expect(
    guest.complete(
      uploadId,
      uploadHash,
      1024,
      'image/png',
      `${tenant}/${eventId}/${randomUUID()}`,
    ),
  ).rejects.toThrow();
  expect((await media.list(eventId, tenant)).length).toBe(1);
  expect(await strangerMedia.list(eventId, tenant)).toEqual([]);
  expect(await guest.shared(hash)).toEqual([]);
  await media.configure(eventId, tenant, 'photo_video', hash, {
    ...config,
    collaborative: true,
    availableAt: '2099-01-01T00:00:00.000Z',
  });
  expect(await guest.shared(hash)).toEqual([]);
  await media.configure(eventId, tenant, 'photo_video', hash, {
    ...config,
    collaborative: true,
  });
  expect((await guest.shared(hash)).length).toBe(1);
  await media.moderate(uploadId, eventId, tenant, { hidden: true });
  expect(await guest.shared(hash)).toEqual([]);
  await media.configure(eventId, tenant, 'photo_video', hash, {
    ...config,
    enabled: false,
  });
  expect(await guest.publicSpace(hash)).toBeNull();
  await expect(
    guest.reserve(hash, randomUUID(), uploadHash, input),
  ).rejects.toThrow();
});

it('persists two-sided designs with tenant isolation and optimistic concurrency', async () => {
  const designs = new NeonDesignRepository(scoped(owner, session)),
    otherDesigns = new NeonDesignRepository(scoped(other, otherSession));
  const document = newThankYou('Merci', randomUUID);
  expect((await designs.save(eventId, tenant, document, 0)).revision).toBe(1);
  expect((await designs.get(eventId, tenant))?.document).toEqual(document);
  expect(await otherDesigns.get(eventId, tenant)).toBeNull();
  await expect(
    otherDesigns.save(eventId, tenant, document, 1),
  ).rejects.toThrow();
  await expect(designs.save(eventId, tenant, document, 0)).rejects.toThrow();
  expect(
    (
      await designs.save(
        eventId,
        tenant,
        { ...document, name: 'Nouvelle carte' },
        1,
      )
    ).revision,
  ).toBe(2);
});

it('gates preview activation separately from payments and prevents cross-tenant grants', async () => {
  await expect(repo.activatePreview(eventId, tenant)).rejects.toThrow();
  await db.exec('UPDATE myevents.preview_settings SET enabled=true');
  await expect(stranger.activatePreview(eventId, tenant)).rejects.toThrow();
  await repo.activatePreview(eventId, tenant);
  expect(await repo.entitlements(eventId, tenant)).toEqual(
    expect.arrayContaining(['invitation', 'audio', 'photo_video', 'thank_you']),
  );
  expect(await stranger.entitlements(eventId, tenant)).toEqual([]);
  expect(
    (await repo.orders(eventId, tenant)).some((o) =>
      o.offer.name.includes('preview'),
    ),
  ).toBe(false);
});
