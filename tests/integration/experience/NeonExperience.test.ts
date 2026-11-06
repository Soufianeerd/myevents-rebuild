import { PGlite } from '@electric-sql/pglite';
import { PgDialect } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { randomUUID, createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { beforeAll, afterAll, it, expect } from 'vitest';
import { NeonPlanningRepository } from '@/providers/neon/NeonPlanningRepository';
import { NeonGuestRepository } from '@/providers/neon/NeonGuestRepository';
import { guestSchema } from '@/core/guests/models';
import { assignCollection } from '@/core/guests/groupings';
import { reconcileResponse } from '@/core/guests/reconciliation';
import { nonResponders, withHouseholds } from '@/core/guests/responses';
import { planningSchema } from '@/core/planning/models';
import { NeonDesignRepository } from '@/providers/neon/NeonDesignRepository';
import { newThankYou } from '@/core/designs/models';
import { NeonMediaRepository } from '@/providers/neon/NeonMediaRepository';
import { NeonExperienceRepository } from '@/providers/neon/NeonExperienceRepository';
import { createInvitationDocument } from '@/core/invitations/templates';
import { getCheckoutOffer, type Order } from '@/core/commerce/catalog';
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
  await db.exec(await readFile('neon/migrations/0007_planning.sql', 'utf8'));
  await db.exec(await readFile('neon/migrations/0008_guests.sql', 'utf8'));
  await db.exec(await readFile('neon/migrations/0009_guest_links.sql', 'utf8'));
  await db.exec(
    await readFile('neon/migrations/0010_design_images.sql', 'utf8'),
  );
  for (const file of [
    '0011_media_photo_collaboration',
    '0012_print_requests',
    '0013_invitation_assets',
    '0014_rsvp_context',
    '0015_profile_names',
    '0016_invitation_music',
  ])
    await db.exec(await readFile(`neon/migrations/${file}.sql`, 'utf8'));
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
    offer: getCheckoutOffer('invitation'),
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
  const offer = getCheckoutOffer('invitation-souvenirs');
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

it('persists planning without sharing tasks or budget with other accounts', async () => {
  const planning = new NeonPlanningRepository(scoped(owner, session)),
    otherPlanning = new NeonPlanningRepository(scoped(other, otherSession));
  const document = planningSchema.parse({
    tasks: [{ id: randomUUID(), title: 'Réserver le lieu', status: 'doing' }],
    budget: [
      {
        id: randomUUID(),
        title: 'Lieu',
        planned: 100000,
        actual: 110000,
        paid: 30000,
      },
    ],
  });
  expect((await planning.save(eventId, tenant, document, 0)).revision).toBe(1);
  expect((await planning.get(eventId, tenant))?.document.budget[0].paid).toBe(
    30000,
  );
  expect(await otherPlanning.get(eventId, tenant)).toBeNull();
  await expect(
    otherPlanning.save(eventId, tenant, document, 1),
  ).rejects.toThrow();
  await expect(planning.save(eventId, tenant, document, 0)).rejects.toThrow();
});

it('isolates guest contacts and rejects stale saves', async () => {
  const guests = new NeonGuestRepository(scoped(owner, session)),
    otherGuests = new NeonGuestRepository(scoped(other, otherSession));
  const document = {
    guests: [
      guestSchema.parse({
        id: randomUUID(),
        name: 'Alice',
        email: 'alice@example.invalid',
        household: 'Famille Martin',
      }),
    ],
  };
  expect((await guests.save(eventId, tenant, document, 0)).revision).toBe(1);
  expect((await guests.get(eventId, tenant))?.document).toEqual(document);
  expect(await otherGuests.get(eventId, tenant)).toBeNull();
  await expect(
    otherGuests.save(eventId, tenant, document, 1),
  ).rejects.toThrow();
  await expect(guests.save(eventId, tenant, document, 0)).rejects.toThrow();
});

it('binds personal invitations to one guest, limits companions and updates a single response', async () => {
  const contacts = new NeonGuestRepository(scoped(owner, session));
  const record = (await contacts.get(eventId, tenant))!;
  const guest = { ...record.document.guests[0], maxCompanions: 2 };
  await contacts.save(eventId, tenant, { guests: [guest] }, record.revision);
  const invitation = (await repo.get(eventId, tenant))!;
  await repo.publish(
    eventId,
    tenant,
    invitation.revision,
    'a'.repeat(64),
    new Date().toISOString(),
  );
  const hash = 'b'.repeat(64);
  await expect(
    stranger.issueGuestLink(eventId, tenant, guest.id, hash),
  ).rejects.toThrow();
  await repo.issueGuestLink(eventId, tenant, guest.id, hash);
  const publicDoc = (await anonymous.getPublic(hash))!;
  expect(publicDoc.guest).toMatchObject({
    id: guest.id,
    name: 'Alice',
    maxCompanions: 2,
  });
  const response = {
    id: randomUUID(),
    guestId: guest.id,
    name: 'Other name',
    email: guest.email,
    presence: 'yes' as const,
    answers: {},
    consent: true as const,
    companions: 3,
  };
  await expect(
    anonymous.respond(
      hash,
      response,
      publicDoc.revision,
      new Date().toISOString(),
    ),
  ).rejects.toThrow();
  await anonymous.respond(
    hash,
    { ...response, companions: 2 },
    publicDoc.revision,
    new Date().toISOString(),
  );
  await anonymous.respond(
    hash,
    { ...response, companions: 1, presence: 'no' },
    publicDoc.revision,
    new Date().toISOString(),
  );
  const rows = (await repo.responses(eventId, tenant)).filter(
    (r) => r.guestId === guest.id,
  );
  expect(rows).toHaveLength(1);
  expect(rows[0]).toMatchObject({
    guestId: guest.id,
    name: 'Alice',
    presence: 'no',
    companions: 0,
  });
  await repo.suspend(eventId, tenant);
  expect(await anonymous.getPublic(hash)).toBeNull();
  await expect(
    anonymous.respond(
      hash,
      { ...response, companions: 0 },
      publicDoc.revision,
      new Date().toISOString(),
    ),
  ).rejects.toThrow();
  await repo.publish(
    eventId,
    tenant,
    invitation.revision,
    'a'.repeat(64),
    new Date().toISOString(),
  );
  await contacts.save(eventId, tenant, { guests: [] }, record.revision + 1);
  expect(await anonymous.getPublic(hash)).toBeNull();
});

it('keeps design images private until published and requires ownership without a gallery entitlement', async () => {
  const media = new NeonMediaRepository(scoped(owner, session)),
    otherMedia = new NeonMediaRepository(scoped(other, otherSession)),
    publicMedia = new NeonMediaRepository(scoped('', ''));
  const id = randomUUID(),
    upload = 'c'.repeat(64),
    input = {
      name: 'Photo personnelle.jpg',
      mime: 'image/jpeg' as const,
      size: 200,
      author: 'Owner',
      consent: true as const,
    };
  await db.query('DELETE FROM myevents.preview_access WHERE event_id=$1', [
    eventId,
  ]);
  await db.query(
    "UPDATE myevents.orders SET status='refunded' WHERE event_id=$1 AND offer->'products' ? 'photo_video'",
    [eventId],
  );
  expect(await repo.entitlements(eventId, tenant)).toContain('invitation');
  expect(await repo.entitlements(eventId, tenant)).not.toContain('photo_video');
  await expect(
    otherMedia.reserveDesign(eventId, tenant, id, upload, input),
  ).rejects.toThrow();
  await media.reserveDesign(eventId, tenant, id, upload, input);
  expect(await media.usage(tenant)).toMatchObject({
    studio: 200,
    pending: 200,
  });
  expect((await otherMedia.usage(tenant)).total).toBe(0);
  const key = `${tenant}/${eventId}/${randomUUID()}`;
  await publicMedia.complete(id, upload, 200, 'image/jpeg', key);
  expect(
    await publicMedia.publicInvitationImage('a'.repeat(64), id),
  ).toBeNull();
  let record = (await repo.get(eventId, tenant))!;
  const document = {
    ...record.draft,
    sections: record.draft.sections.map((s, index) =>
      index === 0 ? { ...s, type: 'image' as const, mediaId: id } : s,
    ),
  };
  record = await repo.save(
    eventId,
    tenant,
    document,
    record.revision,
    new Date().toISOString(),
  );
  expect(
    await publicMedia.publicInvitationImage('a'.repeat(64), id),
  ).toBeNull();
  await repo.publish(
    eventId,
    tenant,
    record.revision,
    'a'.repeat(64),
    new Date().toISOString(),
  );
  expect(await publicMedia.publicInvitationImage('a'.repeat(64), id)).toBe(key);
  expect(
    await publicMedia.publicInvitationImage('d'.repeat(64), id),
  ).toBeNull();
  await expect(
    media.moderate(id, eventId, tenant, { status: 'deleted' }),
  ).rejects.toThrow();
  await repo.suspend(eventId, tenant);
  expect(
    await publicMedia.publicInvitationImage('a'.repeat(64), id),
  ).toBeNull();
  await media.moderate(id, eventId, tenant, { status: 'deleted' });
  await expect(
    repo.publish(
      eventId,
      tenant,
      record.revision,
      'a'.repeat(64),
      new Date().toISOString(),
    ),
  ).rejects.toThrow();
});

it('denies audio gallery settings at adapter and SQL levels without removing contributions', async () => {
  const media = new NeonMediaRepository(scoped(owner, session));
  const offer = getCheckoutOffer('audio');
  const order: Order = {
    id: randomUUID(),
    eventId,
    tenantId: tenant,
    offer,
    status: 'pending',
    sessionId: null,
    createdAt: new Date().toISOString(),
    paidAt: null,
  };
  await repo.createOrder(order);
  await repo.attachSession(order.id, tenant, 'cs_test_audio_private');
  await anonymous.fulfill(
    order.id,
    'cs_test_audio_private',
    offer.amount,
    new Date().toISOString(),
    secret,
  );
  const config = {
    enabled: true,
    collaborative: false,
    allowDownload: false,
    availableAt: '2020-01-01T00:00:00.000Z',
  };
  await media.configure(eventId, tenant, 'audio', 'd'.repeat(64), config);
  await expect(
    media.configure(eventId, tenant, 'audio', 'd'.repeat(64), {
      ...config,
      collaborative: true,
    }),
  ).rejects.toThrow();
  await expect(
    scoped(owner, session).query(
      sql`SELECT myevents.configure_media(${eventId},'audio',${'d'.repeat(64)},${JSON.stringify({ ...config, allowDownload: true })}::jsonb)`,
    ),
  ).rejects.toThrow();
  expect(
    await new NeonMediaRepository(scoped('', '')).shared('d'.repeat(64)),
  ).toEqual([]);
});
it('keeps material requests immutable, idempotent and isolated by tenant', async () => {
  const designs = new NeonDesignRepository(scoped(owner, session));
  const record = (await designs.get(eventId, tenant))!;
  const request = {
    id: randomUUID(),
    eventId,
    tenantId: tenant,
    document: record.document,
    revision: record.revision,
    material: 'Plexiglas',
    quantity: 10,
    finish: 'Transparent',
    notes: '',
    status: 'requested' as const,
    createdAt: new Date().toISOString(),
  };
  expect((await designs.requestMaterial(request)).id).toBe(request.id);
  expect((await designs.requestMaterial(request)).id).toBe(request.id);
  expect(await designs.requests(eventId, tenant)).toHaveLength(1);
  expect(
    await new NeonDesignRepository(scoped(other, otherSession)).requests(
      eventId,
      tenant,
    ),
  ).toEqual([]);
  await expect(
    new NeonDesignRepository(scoped(other, otherSession)).requestMaterial({
      ...request,
      id: randomUUID(),
    }),
  ).rejects.toThrow();
  await expect(
    designs.requestMaterial({ ...request, quantity: 12 }),
  ).rejects.toThrow();
  await expect(
    scoped(owner, session).query(
      sql`UPDATE myevents.material_requests SET payload=payload||'{"status":"accepted"}'::jsonb WHERE id=${request.id}`,
    ),
  ).rejects.toThrow();
});
it('updates only the authenticated profile name, never its tenant, email or role', async () => {
  const { NeonProfileRepository } =
    await import('@/providers/neon/NeonProfileRepository');
  await new NeonProfileRepository(scoped(owner, session)).updateNames(
    owner,
    tenant,
    { firstName: 'Samira', lastName: 'Martin' },
  );
  expect(
    (
      await scoped(owner, session).query(
        sql`SELECT first_name,last_name FROM myevents.profiles WHERE id=${owner}`,
      )
    )[0],
  ).toMatchObject({ first_name: 'Samira', last_name: 'Martin' });
  await expect(
    new NeonProfileRepository(scoped(other, otherSession)).updateNames(
      owner,
      tenant,
      { firstName: 'Intrus', lastName: 'Test' },
    ),
  ).rejects.toThrow();
  await expect(
    scoped(owner, session).query(
      sql`UPDATE myevents.profiles SET member_role='admin' WHERE id=${owner}`,
    ),
  ).rejects.toThrow();
});

it('publishes only owned music and background assets and protects them from deletion', async () => {
  const media = new NeonMediaRepository(scoped(owner, session)),
    publicMedia = new NeonMediaRepository(scoped('', ''));
  const musicId = randomUUID(),
    backgroundId = randomUUID();
  for (const [id, mime, hash] of [
    [musicId, 'audio/wav', 'e'.repeat(64)],
    [backgroundId, 'image/png', 'f'.repeat(64)],
  ] as const) {
    await media.reserveDesign(eventId, tenant, id, hash, {
      name: 'Invitation asset',
      mime,
      size: 100,
      author: 'Organisateur',
      consent: true,
    });
    await publicMedia.complete(
      id,
      hash,
      100,
      mime,
      `${tenant}/${eventId}/${randomUUID()}`,
    );
  }
  let record = (await repo.get(eventId, tenant))!;
  const document = createInvitationDocument(
    {
      name: 'Music test',
      startAt: '2027-07-04T18:00:00.000Z',
      timezone: 'Europe/Paris',
    },
    randomUUID,
  );
  document.music = { mediaId: musicId, volume: 0.5, loop: true };
  document.backgroundMediaId = backgroundId;
  record = await repo.save(
    eventId,
    tenant,
    document,
    record.revision,
    new Date().toISOString(),
  );
  expect(
    await publicMedia.publicInvitationImage('a'.repeat(64), musicId),
  ).toBeNull();
  await repo.publish(
    eventId,
    tenant,
    record.revision,
    'a'.repeat(64),
    new Date().toISOString(),
  );
  expect(
    await publicMedia.publicInvitationImage('a'.repeat(64), musicId),
  ).toBeTruthy();
  expect(
    await publicMedia.publicInvitationImage('a'.repeat(64), backgroundId),
  ).toBeTruthy();
  await expect(
    media.moderate(musicId, eventId, tenant, { status: 'deleted' }),
  ).rejects.toThrow();
  await expect(
    media.moderate(backgroundId, eventId, tenant, { status: 'deleted' }),
  ).rejects.toThrow();
  record = await repo.save(
    eventId,
    tenant,
    { ...document, music: { ...document.music, mediaId: backgroundId } },
    record.revision,
    new Date().toISOString(),
  );
  await expect(
    repo.publish(
      eventId,
      tenant,
      record.revision,
      'a'.repeat(64),
      new Date().toISOString(),
    ),
  ).rejects.toThrow();
});

it('persists household response links with CAS and RLS while preserving original replies after contact deletion', async () => {
  const contacts = new NeonGuestRepository(scoped(owner, session));
  const otherContacts = new NeonGuestRepository(scoped(other, otherSession));
  const workspace = (
    await scoped(owner, session).query(sql`SELECT id FROM myevents.workspaces`)
  )[0];
  const fieldId = 'household';
  const now = new Date().toISOString();
  await db.exec('UPDATE myevents.preview_settings SET enabled=true');
  const fixtures = [];
  for (let index = 0; index < 2; index++) {
    const id = randomUUID(),
      hash = createHash('sha256').update(randomUUID()).digest('hex');
    await scoped(owner, session).query(
      sql`INSERT INTO myevents.events(id,workspace_id,tenant_id,created_by,type,name,start_at,timezone,default_language) VALUES(${id},${String(workspace.id)},${tenant},${owner},'birthday','Foyers','2027-07-04T18:00Z','Europe/Paris','fr')`,
    );
    const document = createInvitationDocument(
      {
        name: 'Foyers',
        startAt: '2027-07-04T18:00:00.000Z',
        timezone: 'Europe/Paris',
      },
      randomUUID,
    );
    document.fields = [
      {
        id: fieldId,
        type: 'text',
        label: 'Votre foyer',
        description: '',
        required: false,
        options: [],
        binding: 'household',
      },
    ];
    const invitation = await repo.save(id, tenant, document, 0, now);
    await repo.activatePreview(id, tenant);
    await repo.publish(id, tenant, invitation.revision, hash, now);
    const response = {
      id: randomUUID(),
      name: 'Samira Martin',
      email: 'samira@example.invalid',
      presence: 'no' as const,
      answers: { [fieldId]: 'Famille Martin' },
      consent: true as const,
    };
    await anonymous.respond(hash, response, invitation.revision, now);
    fixtures.push({ id, hash, response, revision: invitation.revision });
  }
  const [own, foreign] = fixtures;
  const originalResponses = await repo.responses(own.id, tenant);
  const linked = reconcileResponse(
    { guests: [] },
    originalResponses,
    own.response.id,
    null,
    randomUUID,
  );
  let book = await contacts.save(own.id, tenant, linked, 0);
  const guest = book.document.guests[0];
  expect(
    (await contacts.get(own.id, tenant))?.document.guests[0],
  ).toMatchObject({
    name: 'Samira Martin',
    responseId: own.response.id,
    household: 'Famille Martin',
  });
  expect(nonResponders(book.document.guests, originalResponses)).toEqual([]);
  expect(await otherContacts.get(own.id, tenant)).toBeNull();
  expect(await stranger.responses(own.id, tenant)).toEqual([]);
  await expect(
    otherContacts.save(own.id, tenant, { guests: [] }, book.revision),
  ).rejects.toThrow();
  for (const document of [
    { guests: [{ ...guest, responseId: foreign.response.id }] },
    { guests: [guest, { ...guest, id: randomUUID() }] },
  ]) {
    await expect(
      contacts.save(own.id, tenant, document, book.revision),
    ).rejects.toThrow();
  }
  book = await contacts.save(
    own.id,
    tenant,
    assignCollection(book.document, [guest.id], 'household', ''),
    book.revision,
  );
  await expect(
    contacts.save(own.id, tenant, linked, book.revision - 1),
  ).rejects.toThrow(/modifiée ailleurs/);
  expect(
    withHouseholds(
      (await contacts.get(own.id, tenant))!.document,
      originalResponses,
    ).guests[0],
  ).toMatchObject({
    household: '',
    householdAssigned: true,
    responseId: own.response.id,
  });

  const personalGuest = guestSchema.parse({
    id: randomUUID(),
    name: 'Alice',
    email: 'alice@example.invalid',
  });
  book = await contacts.save(
    own.id,
    tenant,
    { guests: [...book.document.guests, personalGuest] },
    book.revision,
  );
  const personalHash = createHash('sha256').update(randomUUID()).digest('hex');
  await repo.issueGuestLink(own.id, tenant, personalGuest.id, personalHash);
  const personalResponse = {
    id: randomUUID(),
    guestId: personalGuest.id,
    name: personalGuest.name,
    email: personalGuest.email,
    presence: 'yes' as const,
    answers: { [fieldId]: 'Foyer Alice' },
    consent: true as const,
  };
  await anonymous.respond(personalHash, personalResponse, own.revision, now);
  await expect(
    contacts.save(
      own.id,
      tenant,
      {
        guests: [{ ...guest, responseId: personalResponse.id }, personalGuest],
      },
      book.revision,
    ),
  ).rejects.toThrow(/ne peut pas être rattachée/);
  const allResponses = await repo.responses(own.id, tenant);
  await contacts.save(own.id, tenant, { guests: [] }, book.revision);
  expect((await contacts.get(own.id, tenant))?.document.guests).toEqual([]);
  expect(await repo.responses(own.id, tenant)).toEqual(allResponses);
  expect(await anonymous.getPublic(personalHash)).toBeNull();
});
