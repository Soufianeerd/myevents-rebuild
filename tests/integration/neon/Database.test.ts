import { PGlite } from '@electric-sql/pglite';
import { PgDialect } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { readFile } from 'node:fs/promises';
import { beforeAll, afterAll, it, expect } from 'vitest';
import type { ScopedDatabase } from '@/providers/neon/database';
import { NeonEventRepository } from '@/providers/neon/NeonEventRepository';
import { NeonWorkspaceRepository } from '@/providers/neon/NeonWorkspaceRepository';
import type { EventId, TenantId, WorkspaceId, UserId } from '@/core/ids';

let db: PGlite;
const id = (n: number) =>
  `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const legacy = id(1),
  owner = id(2),
  other = id(3),
  unverified = id(4),
  viewer = id(5),
  collision = id(6),
  tenant = id(7) as TenantId;
const dialect = new PgDialect();
function scoped(
  user: string,
  session = id(Number(user.slice(-12)) + 100),
): ScopedDatabase {
  return {
    query: (statement) =>
      db.transaction(async (tx) => {
        await tx.exec('SET LOCAL ROLE myevents_app');
        await tx.query(
          "SELECT set_config('myevents.neon_user_id',$1,true),set_config('myevents.neon_session_id',$2,true)",
          [user, session],
        );
        const q = dialect.sqlToQuery(statement);
        return (await tx.query<Record<string, unknown>>(q.sql, q.params)).rows;
      }),
  };
}
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    SET timezone='UTC'; CREATE SCHEMA neon_auth; CREATE SCHEMA auth;
    CREATE TABLE neon_auth."user"(id uuid PRIMARY KEY,name text,email text,"emailVerified" boolean,banned boolean,"banExpires" timestamptz,"createdAt" timestamptz DEFAULT now());
    CREATE TABLE neon_auth.session(id uuid PRIMARY KEY,"userId" uuid,"createdAt" timestamptz,"expiresAt" timestamptz);
    CREATE TABLE neon_auth.account("userId" uuid,"providerId" text,"updatedAt" timestamptz);
    CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,raw_user_meta_data jsonb,created_at timestamptz,updated_at timestamptz);
    CREATE TABLE public.organizations(id uuid PRIMARY KEY,name text,created_at timestamptz,updated_at timestamptz,deleted_at timestamptz);
    CREATE TABLE public.organization_memberships(user_id uuid,organization_id uuid,role text);
    CREATE TABLE public.events(id uuid PRIMARY KEY,organization_id uuid,created_by uuid,event_type text,title text,event_date timestamptz,timezone text,status text,created_at timestamptz,updated_at timestamptz,deleted_at timestamptz);
  `);
  for (const [n, email, verified] of [
    [2, 'owner@example.invalid', true],
    [3, 'other@example.invalid', true],
    [4, 'unverified@example.invalid', false],
    [5, 'viewer@example.invalid', true],
    [6, 'legacy@example.invalid', true],
  ] as const) {
    await db.query(
      'INSERT INTO neon_auth."user"(id,name,email,"emailVerified") VALUES($1,$2,$3,$4)',
      [id(n), 'Test User', email, verified],
    );
    await db.query(
      "INSERT INTO neon_auth.session VALUES($1,$2,now()-interval '1 minute',now()+interval '1 hour')",
      [id(n + 100), id(n)],
    );
  }
  await db.query(
    `INSERT INTO auth.users VALUES($1,'legacy@example.invalid','{"first_name":"Ancien","last_name":"Compte"}','2025-01-01','2025-01-01')`,
    [legacy],
  );
  await db.query(
    "INSERT INTO public.organizations VALUES($1,'Espace récupéré','2025-01-01','2025-01-01',null)",
    [tenant],
  );
  await db.query(
    "INSERT INTO public.organization_memberships VALUES($1,$2,'owner')",
    [legacy, tenant],
  );
  await db.query(
    "INSERT INTO public.events VALUES($1,$2,$3,'wedding','Événement récupéré','2027-06-12T12:00Z','Europe/Paris','ready_for_publish','2025-01-01','2025-01-01',null)",
    [id(8), tenant, legacy],
  );
  await db.exec(await readFile('neon/migrations/0001_application.sql', 'utf8'));
  await db.exec(
    await readFile('neon/migrations/0002_legacy_import.sql', 'utf8'),
  );
  // Explicit operator binding, not an email lookup at login.
  await db.query(
    'UPDATE myevents.profiles SET neon_user_id=$1 WHERE legacy_user_id=$2',
    [owner, legacy],
  );
  await scoped(other).query(sql`SELECT * FROM myevents.ensure_identity()`);
  await scoped(viewer).query(sql`SELECT * FROM myevents.ensure_identity()`);
  await db.query(
    "UPDATE myevents.profiles SET member_role='viewer' WHERE neon_user_id=$1",
    [viewer],
  );
}, 120000);
afterAll(async () => {
  await db?.close();
});

it('preserves source IDs, ownership, timestamps and lifecycle while leaving the recovered source intact', async () => {
  const e = await new NeonEventRepository(scoped(owner)).findById(
    id(8) as EventId,
    tenant,
  );
  expect(e).toMatchObject({
    id: id(8),
    tenantId: tenant,
    createdBy: legacy,
    lifecycleStatus: 'ready_for_publish',
    createdAt: '2025-01-01T00:00:00.000Z',
    startAt: '2027-06-12T12:00:00.000Z',
  });
  const original = (await db.query('SELECT * FROM public.events')).rows;
  await new NeonEventRepository(scoped(owner)).update({
    ...e!,
    name: "L'événement — modifié",
    updatedAt: '2026-09-14T12:00:00.000Z',
  });
  expect(
    (
      await new NeonEventRepository(scoped(owner)).findById(
        id(8) as EventId,
        tenant,
      )
    )?.lifecycleStatus,
  ).toBe('ready_for_publish');
  expect((await db.query('SELECT * FROM public.events')).rows).toEqual(
    original,
  );
});
it('isolates tenants and refuses unverified, forged, expired and revoked sessions', async () => {
  for (const account of [other, unverified]) {
    expect(
      await new NeonEventRepository(scoped(account)).findById(
        id(8) as EventId,
        tenant,
      ),
    ).toBeNull();
    expect(
      await new NeonWorkspaceRepository(scoped(account)).findByTenantId(tenant),
    ).toEqual([]);
  }
  expect(
    await scoped(owner, id(103)).query(
      sql`SELECT * FROM myevents.current_profile()`,
    ),
  ).toEqual([]);
  await db.query(
    'UPDATE neon_auth.session SET "expiresAt"=now()-interval \'1 second\' WHERE id=$1',
    [id(102)],
  );
  expect(
    await scoped(owner).query(sql`SELECT * FROM myevents.current_profile()`),
  ).toEqual([]);
  await db.query(
    'UPDATE neon_auth.session SET "expiresAt"=now()+interval \'1 hour\' WHERE id=$1',
    [id(102)],
  );
  await db.query(
    `INSERT INTO neon_auth.account VALUES($1,'credential',now())`,
    [owner],
  );
  expect(
    await scoped(owner).query(sql`SELECT * FROM myevents.current_profile()`),
  ).toEqual([]);
  await db.query(
    'UPDATE neon_auth.account SET "updatedAt"=now()-interval \'2 minutes\' WHERE "userId"=$1',
    [owner],
  );
  expect(
    await scoped(owner).query(sql`SELECT * FROM myevents.current_profile()`),
  ).toHaveLength(1);
});
it('never claims a legacy identity by email and preserves first/last names for new signups', async () => {
  await expect(
    scoped(collision).query(sql`SELECT * FROM myevents.ensure_identity()`),
  ).rejects.toThrow('explicit binding');
  await scoped(unverified).query(
    sql`SELECT myevents.save_registration_names(${unverified}::uuid,'Test','User')`,
  );
  expect(
    await scoped(unverified).query(
      sql`SELECT * FROM myevents.ensure_identity()`,
    ),
  ).toEqual([]);
  await db.query(
    'UPDATE neon_auth."user" SET "emailVerified"=true WHERE id=$1',
    [unverified],
  );
  const p = await scoped(unverified).query(
    sql`SELECT * FROM myevents.ensure_identity()`,
  );
  expect(p[0]).toMatchObject({ first_name: 'Test', last_name: 'User' });
  expect(p[0].tenant_id).not.toBe(tenant);
  await db.query(
    'UPDATE neon_auth."user" SET "emailVerified"=false WHERE id=$1',
    [unverified],
  );
});
it('denies viewer writes, impersonation, legacy access and immutable field changes', async () => {
  const dbOwner = scoped(owner);
  await expect(
    dbOwner.query(
      sql`UPDATE myevents.profiles SET tenant_id=gen_random_uuid()`,
    ),
  ).rejects.toThrow();
  await expect(dbOwner.query(sql`SELECT * FROM auth.users`)).rejects.toThrow();
  await expect(
    dbOwner.query(sql`SELECT * FROM neon_auth.session`),
  ).rejects.toThrow();
  await expect(
    dbOwner.query(sql`UPDATE myevents.events SET lifecycle_status='draft'`),
  ).rejects.toThrow();
  await expect(
    dbOwner.query(sql`DELETE FROM myevents.events`),
  ).rejects.toThrow();
  const viewerProfile = (
    await scoped(viewer).query(sql`SELECT * FROM myevents.current_profile()`)
  )[0];
  const workspace = (
    await new NeonWorkspaceRepository(scoped(viewer)).findByTenantId(
      viewerProfile.tenant_id as TenantId,
    )
  )[0];
  await expect(
    new NeonWorkspaceRepository(scoped(viewer)).update({
      ...workspace,
      name: 'Interdit',
    }),
  ).rejects.toThrow();
  const e = (await new NeonEventRepository(dbOwner).findById(
    id(8) as EventId,
    tenant,
  ))!;
  await expect(
    new NeonEventRepository(scoped(viewer)).create({
      ...e,
      id: id(10) as EventId,
      tenantId: workspace.tenantId,
      workspaceId: workspace.id,
      createdBy: viewer as UserId,
      lifecycleStatus: 'draft',
    }),
  ).rejects.toThrow();
  await expect(
    new NeonEventRepository(dbOwner).create({
      ...e,
      id: id(11) as EventId,
      workspaceId: workspace.id as WorkspaceId,
      lifecycleStatus: 'draft',
    }),
  ).rejects.toThrow();
});
it('validates dates and timezones, parameterizes text, and soft-deletes without resurrection', async () => {
  const repo = new NeonEventRepository(scoped(owner));
  const e = (await repo.findById(id(8) as EventId, tenant))!;
  await expect(
    repo.update({ ...e, timezone: 'Invented/Zone' }),
  ).rejects.toThrow();
  await expect(
    repo.update({ ...e, endAt: '2024-01-01T00:00:00.000Z' }),
  ).rejects.toThrow();
  const created = {
    ...e,
    id: id(12) as EventId,
    name: "x'); DROP TABLE myevents.events; --",
    lifecycleStatus: 'draft' as const,
  };
  await repo.create(created);
  expect((await repo.findById(created.id, tenant))?.name).toBe(created.name);
  await repo.update({ ...created, deletedAt: '2026-09-14T12:00:00.000Z' });
  expect(await repo.findById(created.id, tenant)).toBeNull();
  expect(
    (await repo.findByWorkspaceId(e.workspaceId, tenant)).map((e) => e.id),
  ).not.toContain(created.id);
  await expect(repo.update(created)).rejects.toThrow();
  expect(
    (
      await db.query(
        "SELECT current_setting('myevents.neon_user_id',true) AS claim,current_user AS role",
      )
    ).rows[0],
  ).toMatchObject({ claim: '', role: 'postgres' });
});
