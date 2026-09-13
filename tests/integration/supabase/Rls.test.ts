import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { beforeAll, afterAll, expect, it } from 'vitest';

// Real PostgreSQL policy execution in WASM. Only Supabase-owned auth/storage
// tables and auth.uid() are represented by fixtures; application SQL is unchanged.
let db: PGlite;
const owner = '00000000-0000-4000-8000-000000000001';
const stranger = '00000000-0000-4000-8000-000000000002';
const workspace = '00000000-0000-4000-8000-000000000003';
const event = '00000000-0000-4000-8000-000000000004';
let tenant: string;

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth; create schema storage;
    grant usage on schema public, auth, storage to anon, authenticated;
    create table auth.users (id uuid primary key, raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create table storage.buckets (id text primary key, name text, public boolean);
    create table storage.objects (id uuid default gen_random_uuid(), bucket_id text, name text);
    alter table storage.objects enable row level security;
    grant select, insert, update, delete on storage.objects to authenticated, anon;
    create function storage.foldername(name text) returns text[] language sql immutable as $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1)-1] $$;
  `);
  await db.exec(
    await readFile('supabase/migrations/202609130001_foundation.sql', 'utf8'),
  );
  await db.exec(
    await readFile(
      'supabase/migrations/202609130002_private_storage.sql',
      'utf8',
    ),
  );
  await db.query(
    `insert into auth.users (id, raw_user_meta_data) values ($1, $3), ($2, $3)`,
    [
      owner,
      stranger,
      JSON.stringify({
        first_name: 'Test',
        last_name: 'User',
        tenant_id: 'attacker-controlled',
      }),
    ],
  );
  tenant = (
    await db.query<{ tenant_id: string }>(
      'select tenant_id from public.profiles where id = $1',
      [owner],
    )
  ).rows[0].tenant_id;
}, 120_000);
afterAll(async () => {
  await db?.close();
});

async function asUser(id: string) {
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
  await db.exec('set role authenticated');
}

it('enforces tenant ownership, immutable identities and private storage against direct SQL', async () => {
  expect(tenant).not.toBe('attacker-controlled');
  await asUser(owner);
  expect((await db.query('select * from public.profiles')).rows).toHaveLength(
    1,
  );
  await expect(
    db.query('update public.profiles set tenant_id = gen_random_uuid()'),
  ).rejects.toThrow();
  await db.query(
    'insert into public.workspaces (id, tenant_id, name) values ($1,$2,$3)',
    [workspace, tenant, 'Personnel'],
  );
  await db.query(
    `insert into public.events (id, workspace_id, tenant_id, created_by, type, name, start_at, timezone, default_language) values ($1,$2,$3,$4,'wedding','Privé','2026-12-10T14:00Z','Europe/Paris','fr')`,
    [event, workspace, tenant, owner],
  );
  await expect(
    db.query(
      "update public.events set lifecycle_status='published' where id=$1",
      [event],
    ),
  ).rejects.toThrow();
  await expect(
    db.query("update public.events set timezone='Invented/Zone' where id=$1", [
      event,
    ]),
  ).rejects.toThrow();
  await expect(
    db.query("update public.events set end_at='2026-01-01' where id=$1", [
      event,
    ]),
  ).rejects.toThrow();
  await expect(
    db.query(
      'update public.events set tenant_id=gen_random_uuid() where id=$1',
      [event],
    ),
  ).rejects.toThrow();
  await db.exec('reset role');
  const object = `${tenant}/${event}/asset.png`;
  await db.query(
    "insert into storage.objects (bucket_id,name) values ('event-assets',$1)",
    [object],
  );
  await asUser(owner);
  expect((await db.query('select * from storage.objects')).rows).toHaveLength(
    1,
  );
  await expect(
    db.query(
      "insert into storage.objects (bucket_id,name) values ('event-assets',$1)",
      [object + '-unchecked-upload'],
    ),
  ).rejects.toThrow();
  await asUser(stranger);
  expect((await db.query('select * from public.events')).rows).toHaveLength(0);
  expect((await db.query('select * from public.workspaces')).rows).toHaveLength(
    0,
  );
  expect((await db.query('select * from storage.objects')).rows).toHaveLength(
    0,
  );
  expect(
    (
      await db.query(
        "update public.events set name='Attack' where id=$1 returning id",
        [event],
      )
    ).rows,
  ).toHaveLength(0);
  expect(
    (await db.query('delete from storage.objects returning id')).rows,
  ).toHaveLength(0);
  await expect(
    db.query('insert into public.workspaces (tenant_id,name) values ($1,$2)', [
      tenant,
      'Attacked',
    ]),
  ).rejects.toThrow();
  await db.exec('reset role; set role anon');
  await expect(db.query('select * from public.events')).rejects.toThrow();
  expect((await db.query('select * from storage.objects')).rows).toHaveLength(
    0,
  );
  await asUser(owner);
  expect(
    (
      await db.query(
        'update public.events set deleted_at=now() where id=$1 returning id',
        [event],
      )
    ).rows,
  ).toHaveLength(1);
  expect((await db.query('select * from storage.objects')).rows).toHaveLength(
    0,
  );
  expect(
    (
      await db.query(
        'update public.events set deleted_at=null where id=$1 returning id',
        [event],
      )
    ).rows,
  ).toHaveLength(0);
}, 120_000);
