import { Client } from 'pg';
import { randomUUID, randomBytes } from 'node:crypto';
import { it, expect } from 'vitest';
// Explicit opt-in. All fixtures, including managed Auth rows, are rolled back.
// This validates SQL authorization on Neon, not email delivery or SDK login.
const url = process.env.NEON_TEST_DATABASE_URL;
it.skipIf(!url)(
  'enforces real Neon RLS, role restrictions, persistence and session revocation',
  async () => {
    const target = new URL(url!);
    expect(target.hostname).toBe(
      'ep-fancy-brook-b1nk9qf4.c-5.eu-central-1.aws.neon.tech',
    );
    expect(target.pathname).toBe('/myevents');
    const client = new Client({ connectionString: target.toString() });
    const user = randomUUID(),
      other = randomUUID(),
      session = randomUUID(),
      otherSession = randomUUID(),
      event = randomUUID();
    await client.connect();
    try {
      await client.query('BEGIN');
      // Temporary role switching permission; rolled back with every fixture.
      await client.query('GRANT myevents_app TO CURRENT_USER WITH SET TRUE');
      await client.query("SET LOCAL statement_timeout='15s'");
      const original = (
        await client.query('SELECT count(*)::int AS count FROM myevents.events')
      ).rows[0].count;
      for (const [id, sid] of [
        [user, session],
        [other, otherSession],
      ]) {
        await client.query(
          'INSERT INTO neon_auth."user"(id,name,email,"emailVerified","createdAt","updatedAt") VALUES($1,$2,$3,true,now(),now())',
          [id, 'Migration Test', `migration-${id}@example.invalid`],
        );
        await client.query(
          'INSERT INTO neon_auth.session(id,"userId",token,"createdAt","updatedAt","expiresAt") VALUES($1,$2,$3,now(),now(),now()+interval \'1 hour\')',
          [sid, id, randomBytes(32).toString('hex')],
        );
      }
      const asUser = async (id: string, sid: string) => {
        await client.query('RESET ROLE');
        await client.query(
          "SELECT set_config('myevents.neon_user_id',$1,true),set_config('myevents.neon_session_id',$2,true)",
          [id, sid],
        );
        await client.query('SET LOCAL ROLE myevents_app');
      };
      await asUser(user, session);
      const profile = (
        await client.query('SELECT * FROM myevents.ensure_identity()')
      ).rows[0];
      const workspace = (
        await client.query('SELECT id FROM myevents.workspaces')
      ).rows[0];
      expect(profile.neon_user_id).toBe(user);
      await client.query(
        `INSERT INTO myevents.events(id,workspace_id,tenant_id,created_by,type,name,start_at,timezone,default_language) VALUES($1,$2,$3,$4,'wedding','Test transaction Neon','2027-06-12T12:00Z','Europe/Paris','fr')`,
        [event, workspace.id, profile.tenant_id, profile.id],
      );
      expect(
        (await client.query('SELECT id FROM myevents.events')).rows,
      ).toEqual([{ id: event }]);
      await asUser(other, otherSession);
      await client.query('SELECT * FROM myevents.ensure_identity()');
      expect(
        (
          await client.query('SELECT id FROM myevents.events WHERE id=$1', [
            event,
          ])
        ).rows,
      ).toEqual([]);
      expect(
        (
          await client.query(
            "UPDATE myevents.events SET name='forbidden' WHERE id=$1 RETURNING id",
            [event],
          )
        ).rows,
      ).toEqual([]);
      await asUser(user, otherSession);
      expect(
        (await client.query('SELECT * FROM myevents.current_profile()')).rows,
      ).toEqual([]);
      await client.query('RESET ROLE');
      await client.query(
        'UPDATE neon_auth.session SET "expiresAt"=now()-interval \'1 second\' WHERE id=$1',
        [session],
      );
      await asUser(user, session);
      expect(
        (await client.query('SELECT * FROM myevents.current_profile()')).rows,
      ).toEqual([]);
      await client.query('RESET ROLE');
      expect(
        (
          await client.query(
            'SELECT count(*)::int AS count FROM myevents.events',
          )
        ).rows[0].count,
      ).toBe(original + 1);
      await client.query('ROLLBACK');
      expect(
        (
          await client.query(
            'SELECT count(*)::int AS count FROM myevents.events',
          )
        ).rows[0].count,
      ).toBe(original);
      expect(
        (
          await client.query(
            'SELECT id FROM neon_auth."user" WHERE id=ANY($1::uuid[])',
            [[user, other]],
          )
        ).rows,
      ).toEqual([]);
    } finally {
      await client.query('ROLLBACK').catch(() => {});
      await client.end();
    }
  },
  60000,
);
