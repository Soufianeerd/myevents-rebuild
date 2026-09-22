import { Client } from 'pg';
import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import { randomBytes, createHash } from 'node:crypto';
import { targetConnection } from './prepare-application.mjs';
const mode = process.argv[2];
if (!['--plan', '--apply'].includes(mode))
  throw new Error('Use --plan or --apply.');
const config = parseEnv(await readFile('.env.migration.local', 'utf8'));
const client = new Client({
  connectionString: targetConnection(
    config.NEON_MIGRATION_DATABASE_URL,
  ).toString(),
});
await client.connect();
try {
  await client.query('BEGIN');
  await client.query("SET LOCAL statement_timeout='60s'");
  await client.query(
    "SELECT pg_advisory_xact_lock(hashtextextended('myevents-experience-migrations',0))",
  );
  const applied = new Set(
    (await client.query('SELECT version FROM myevents.migrations')).rows.map(
      (r) => r.version,
    ),
  );
  const names = (await readdir('neon/migrations'))
    .filter(
      (f) =>
        /^\d{4}_[a-z_]+\.sql$/.test(f) && !applied.has(f.replace('.sql', '')),
    )
    .sort();
  console.log(
    JSON.stringify({ target: 'migration-staging', pending: names, mode }),
  );
  if (mode === '--plan') {
    await client.query('ROLLBACK');
  } else {
    for (const name of names)
      await client.query(await readFile(`neon/migrations/${name}`, 'utf8'));
    let secrets;
    try {
      if ((await stat('.env.payments.local')).mode & 0o077)
        throw new Error('Private permissions required.');
      secrets = parseEnv(await readFile('.env.payments.local', 'utf8'));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      secrets = { PAYMENT_FULFILLMENT_SECRET: randomBytes(32).toString('hex') };
      await writeFile(
        '.env.payments.local',
        `PAYMENT_FULFILLMENT_SECRET=${secrets.PAYMENT_FULFILLMENT_SECRET}\n`,
        { mode: 0o600 },
      );
    }
    const hash = createHash('sha256')
      .update(secrets.PAYMENT_FULFILLMENT_SECRET)
      .digest('hex');
    const existing = (
      await client.query(
        "SELECT hash FROM myevents.service_secrets WHERE name='payments'",
      )
    ).rows[0];
    if (existing && existing.hash !== hash)
      throw new Error('Existing payment secret does not match.');
    await client.query(
      "INSERT INTO myevents.service_secrets(name,hash) VALUES('payments',$1) ON CONFLICT DO NOTHING",
      [hash],
    );
    await client.query('COMMIT');
    console.log(
      'Additive staging migrations committed; source schemas unchanged.',
    );
  }
} catch {
  await client.query('ROLLBACK');
  console.error('Staging extension failed; transaction rolled back.');
  process.exitCode = 1;
} finally {
  await client.end();
}
