// Additive, staging-only migration. Never uses the runtime role for DDL.
import { Client } from 'pg';
import { readFile, writeFile, stat, rename, unlink } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { parseEnv } from 'node:util';
import { createHash, randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const target = 'ep-fancy-brook-b1nk9qf4.c-5.eu-central-1.aws.neon.tech';
export function targetConnection(value) {
  const url = new URL(value);
  url.hostname = url.hostname.replace('-pooler.', '.');
  if (
    url.hostname !== target ||
    url.pathname !== '/myevents' ||
    url.username !== 'myevents_owner' ||
    !url.password ||
    !['postgres:', 'postgresql:'].includes(url.protocol)
  )
    throw new Error('Unexpected migration target.');
  url.searchParams.set('sslmode', 'verify-full');
  return url;
}
export async function fingerprint(client, tables) {
  const result = [];
  for (const table of tables) {
    if (
      !/^(auth|public|private|storage|supabase_migrations)\.[a-z_][a-z0-9_]*$/.test(
        table.name,
      )
    )
      throw new Error('Unexpected source table.');
    const [schema, name] = table.name.split('.');
    const rows = (
      await client.query(
        `SELECT to_jsonb(t) AS row FROM "${schema}"."${name}" t`,
      )
    ).rows
      .map((r) => JSON.stringify(r.row))
      .sort();
    result.push({
      name: table.name,
      rows: rows.length,
      sha256: createHash('sha256').update(JSON.stringify(rows)).digest('hex'),
    });
  }
  return result;
}
async function main() {
  const [mode, backup] = process.argv.slice(2);
  if (
    !['--plan', '--apply'].includes(mode) ||
    !backup ||
    process.argv.length !== 4
  )
    throw new Error(
      'Usage: prepare-application.mjs --plan|--apply <private-backup-directory>',
    );
  const directory = resolve(backup);
  if ((await stat(directory)).mode & 0o077)
    throw new Error('Backup directory must be private.');
  const evidence = JSON.parse(
    await readFile(join(directory, 'neon-restore-verified.json'), 'utf8'),
  );
  if (evidence.target_host !== target || evidence.tables.length !== 39)
    throw new Error('Verified source restore is required.');
  const files = ['0001_application.sql', '0002_legacy_import.sql'];
  const migrations = await Promise.all(
    files.map(async (name) => ({
      name,
      sql: await readFile(
        new URL(`../../neon/migrations/${name}`, import.meta.url),
        'utf8',
      ),
    })),
  );
  const config = parseEnv(await readFile('.env.migration.local', 'utf8'));
  const url = targetConnection(config.NEON_MIGRATION_DATABASE_URL);
  const client = new Client({
    connectionString: url.toString(),
    connectionTimeoutMillis: 15000,
  });
  await client.connect();
  let pending = false;
  let committed = false;
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL statement_timeout='60s'");
    if (
      (await client.query("SELECT to_regnamespace('myevents') AS schema"))
        .rows[0].schema
    )
      throw new Error(
        'Application schema already exists; inspect before proceeding.',
      );
    const before = await fingerprint(client, evidence.tables);
    if (
      before.some(
        (t) => evidence.tables.find((s) => s.name === t.name)?.rows !== t.rows,
      )
    )
      throw new Error('Recovered source counts changed.');
    const auth = (
      await client.query(
        `SELECT count(*)::int AS count FROM information_schema.tables WHERE table_schema='neon_auth' AND table_name IN ('user','session','account')`,
      )
    ).rows[0];
    if (auth.count !== 3) throw new Error('Provision managed Neon Auth first.');
    if (mode === '--plan') {
      await client.query('ROLLBACK');
      console.log(
        JSON.stringify({
          target: 'migration-staging',
          sourceTables: before.length,
          migrations: files,
          action: 'add application schema and preserve recovered schemas',
        }),
      );
      return;
    }
    for (const migration of migrations) await client.query(migration.sql);
    const after = await fingerprint(client, evidence.tables);
    if (JSON.stringify(before) !== JSON.stringify(after))
      throw new Error('Recovered source changed during migration.');
    const counts = (
      await client.query(
        'SELECT (SELECT count(*)::int FROM myevents.profiles) AS profiles,(SELECT count(*)::int FROM myevents.workspaces) AS workspaces,(SELECT count(*)::int FROM myevents.events) AS events',
      )
    ).rows[0];
    const password = randomBytes(32).toString('hex');
    // Generated hex only; PostgreSQL does not accept bind parameters in ALTER ROLE.
    await client.query(`ALTER ROLE myevents_app LOGIN PASSWORD '${password}'`);
    await client.query('GRANT CONNECT ON DATABASE myevents TO myevents_app');
    const runtime = new URL(url);
    runtime.hostname = target.replace('.c-5.', '-pooler.c-5.');
    runtime.username = 'myevents_app';
    runtime.password = password;
    const privateEnv = `APP_MODE=connected\nCONNECTED_PROVIDER=neon\nAPP_URL=http://localhost:3300\nDATABASE_URL=${runtime}\nNEON_AUTH_BASE_URL=https://ep-fancy-brook-b1nk9qf4.neonauth.c-5.eu-central-1.aws.neon.tech/myevents/auth\nNEON_AUTH_COOKIE_SECRET=${randomBytes(32).toString('hex')}\n`;
    await writeFile('.env.neon.local.pending', privateEnv, {
      mode: 0o600,
      flag: 'wx',
    });
    pending = true;
    // Do not overwrite credentials from an earlier run.
    try {
      await stat('.env.neon.local');
      throw new Error('Runtime configuration already exists.');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    await client.query('COMMIT');
    committed = true;
    await rename('.env.neon.local.pending', '.env.neon.local');
    pending = false;
    const report = {
      target: 'migration-staging',
      appliedAt: new Date().toISOString(),
      migrations: migrations.map((m) => ({
        name: m.name,
        sha256: createHash('sha256').update(m.sql).digest('hex'),
      })),
      sourceTablesUnchanged: before.length,
      counts,
      legacyAccountsBound: 0,
      authRecovery: 'explicit identity binding required',
    };
    await writeFile(
      join(directory, 'neon-application-verified.json'),
      JSON.stringify(report, null, 2) + '\n',
      { mode: 0o600, flag: 'wx' },
    );
    console.log(JSON.stringify(report));
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    if (pending && !committed)
      await unlink('.env.neon.local.pending').catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  main().catch((error) => {
    const safe = [
      'Unexpected migration target.',
      'Backup directory must be private.',
      'Verified source restore is required.',
      'Unexpected source table.',
      'Application schema already exists; inspect before proceeding.',
      'Recovered source counts changed.',
      'Provision managed Neon Auth first.',
      'Recovered source changed during migration.',
      'Runtime configuration already exists.',
    ];
    console.error(
      safe.includes(error.message)
        ? error.message
        : `Application preparation failed (${error.code ?? error.name}); credentials and SQL details withheld.`,
    );
    process.exitCode = 1;
  });
