// Explicit operator mapping after the owner has verified their new Neon identity.
import { Client } from 'pg';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { targetConnection } from './prepare-application.mjs';
export function validateBinding(source, target) {
  if (
    !source ||
    !target ||
    !source.email_confirmed_at ||
    !target.emailVerified ||
    target.banned ||
    source.email.trim().toLowerCase() !== target.email.trim().toLowerCase()
  )
    throw new Error('Verified source and target identities are required.');
  if (source.neon_user_id && source.neon_user_id !== target.id)
    throw new Error('Legacy identity is already bound to another account.');
}
async function main() {
  const [mode, legacyId, neonId, backup] = process.argv.slice(2);
  const uuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (
    !['--plan', '--apply'].includes(mode) ||
    !uuid.test(legacyId ?? '') ||
    !uuid.test(neonId ?? '') ||
    !backup ||
    process.argv.length !== 6
  )
    throw new Error(
      'Usage: bind-legacy-identity.mjs --plan|--apply <legacy-user-uuid> <verified-neon-user-uuid> <private-backup-directory>',
    );
  const directory = resolve(backup);
  if ((await stat(directory)).mode & 0o077)
    throw new Error('Backup directory must be private.');
  const config = parseEnv(await readFile('.env.migration.local', 'utf8'));
  const client = new Client({
    connectionString: targetConnection(
      config.NEON_MIGRATION_DATABASE_URL,
    ).toString(),
  });
  await client.connect();
  try {
    await client.query('BEGIN');
    const source = (
      await client.query(
        'SELECT p.id,p.neon_user_id,p.tenant_id,u.email,u.email_confirmed_at FROM myevents.profiles p JOIN auth.users u ON u.id=p.legacy_user_id WHERE p.legacy_user_id=$1 FOR UPDATE OF p',
        [legacyId],
      )
    ).rows[0];
    const target = (
      await client.query(
        'SELECT id,email,"emailVerified",banned FROM neon_auth."user" WHERE id=$1 FOR SHARE',
        [neonId],
      )
    ).rows[0];
    validateBinding(source, target);
    if (
      (
        await client.query(
          'SELECT id FROM myevents.profiles WHERE neon_user_id=$1 AND id<>$2',
          [neonId, source.id],
        )
      ).rowCount
    )
      throw new Error(
        'Target already owns an application profile; explicit merge review required.',
      );
    const events = (
      await client.query(
        'SELECT count(*)::int AS count FROM myevents.events WHERE tenant_id=$1',
        [source.tenant_id],
      )
    ).rows[0].count;
    const report = {
      legacyUserId: legacyId,
      neonUserId: neonId,
      tenantId: source.tenant_id,
      events,
      verifiedEmailMatch: true,
      mode,
      status: mode === '--apply' ? 'prepared' : 'plan',
      at: new Date().toISOString(),
    };
    if (mode === '--apply') {
      await client.query(
        'UPDATE myevents.profiles SET neon_user_id=$1,updated_at=now() WHERE legacy_user_id=$2',
        [neonId, legacyId],
      );
      await writeFile(
        join(directory, `identity-binding-${neonId}.json`),
        JSON.stringify(report, null, 2) + '\n',
        { mode: 0o600, flag: 'wx' },
      );
      await client.query('COMMIT');
      await writeFile(
        join(directory, `identity-binding-${neonId}.json`),
        JSON.stringify({ ...report, status: 'applied' }, null, 2) + '\n',
        { mode: 0o600 },
      );
    } else await client.query('ROLLBACK');
    console.log(
      JSON.stringify({ mode, verifiedEmailMatch: true, profiles: 1, events }),
    );
  } finally {
    await client.query('ROLLBACK').catch(() => {});
    await client.end();
  }
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  main().catch((error) => {
    console.error(
      `Identity binding refused (${error.code ?? error.name}). Check the explicit mapping and verification status; private details withheld.`,
    );
    process.exitCode = 1;
  });
