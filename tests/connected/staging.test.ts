import { createClient } from '@supabase/supabase-js';
import { expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';

it('persists events in staging and rejects cross-tenant SDK access', async () => {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_PUBLISHABLE_KEY',
    'STAGING_USER_A_EMAIL',
    'STAGING_USER_A_PASSWORD',
    'STAGING_USER_B_EMAIL',
    'STAGING_USER_B_PASSWORD',
  ] as const;
  if (
    process.env.MYEVENTS_STAGING_TESTS !== '1' ||
    required.some((key) => !process.env[key])
  ) {
    throw new Error(
      'Staging verification needs MYEVENTS_STAGING_TESTS=1 and the six documented staging variables. Never supply production accounts.',
    );
  }
  if (process.env.STAGING_USER_A_EMAIL === process.env.STAGING_USER_B_EMAIL)
    throw new Error('Two distinct staging accounts are required.');
  const makeClient = () =>
    createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  const a = makeClient();
  const b = makeClient();
  const anonymous = makeClient();
  let eventId: string | undefined;
  try {
    for (const [client, suffix] of [
      [a, 'A'],
      [b, 'B'],
    ] as const) {
      const { error } = await client.auth.signInWithPassword({
        email: process.env[`STAGING_USER_${suffix}_EMAIL`]!,
        password: process.env[`STAGING_USER_${suffix}_PASSWORD`]!,
      });
      expect(error === null, `staging user ${suffix} login`).toBe(true);
    }
    const { data: profile, error: profileError } = await a
      .from('profiles')
      .select('id,tenant_id')
      .single();
    expect(profileError === null, 'profile migration and RLS').toBe(true);
    const { error: workspaceError } = await a.from('workspaces').upsert(
      {
        id: randomUUID(),
        tenant_id: profile!.tenant_id,
        name: 'Validation staging',
      },
      { onConflict: 'tenant_id', ignoreDuplicates: true },
    );
    expect(workspaceError === null, 'primary workspace').toBe(true);
    const { data: workspace } = await a
      .from('workspaces')
      .select('id')
      .eq('tenant_id', profile!.tenant_id)
      .single();
    eventId = randomUUID();
    const { error: createError } = await a.from('events').insert({
      id: eventId,
      workspace_id: workspace!.id,
      tenant_id: profile!.tenant_id,
      created_by: profile!.id,
      type: 'other',
      name: 'Validation technique staging',
      start_at: '2026-12-10T14:00:00Z',
      timezone: 'Europe/Paris',
      default_language: 'fr',
    });
    expect(createError === null, 'event persistence').toBe(true);
    expect(
      (await a.from('events').select('id').eq('id', eventId)).data?.length,
    ).toBe(1);
    expect(
      (await b.from('events').select('id').eq('id', eventId)).data?.length,
    ).toBe(0);
    const attack = await b
      .from('events')
      .update({ name: 'Denied mutation' })
      .eq('id', eventId)
      .select('id');
    expect(attack.data?.length).toBe(0);
    expect(
      (
        await a
          .from('events')
          .update({ tenant_id: randomUUID() })
          .eq('id', eventId)
      ).error !== null,
    ).toBe(true);
    expect(
      (
        await a
          .from('events')
          .update({ lifecycle_status: 'published' })
          .eq('id', eventId)
      ).error !== null,
    ).toBe(true);
    const guest = await anonymous.from('events').select('id').eq('id', eventId);
    expect(guest.data === null || guest.data.length === 0).toBe(true);
    const files = await a.storage
      .from('event-assets')
      .list(`${profile!.tenant_id}/${eventId}`);
    expect(files.error === null, 'private bucket exists').toBe(true);
    const publicRead = await anonymous.storage
      .from('event-assets')
      .download(`${profile!.tenant_id}/${eventId}/nonexistent.png`);
    expect(publicRead.error !== null).toBe(true);
  } finally {
    if (eventId)
      await a
        .from('events')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', eventId);
    await Promise.all([
      a.auth.signOut({ scope: 'local' }),
      b.auth.signOut({ scope: 'local' }),
    ]);
  }
}, 120_000);
