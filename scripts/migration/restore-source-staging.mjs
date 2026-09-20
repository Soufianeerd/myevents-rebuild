// Recover the authorized source into the previously inspected, empty staging DB.
// This preserves legacy data; it does not enable Neon Auth or connect the app.
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const schemas = ['auth', 'public', 'private', 'storage', 'supabase_migrations'];
const sourceProject = 'cipzwuurweaeohgxzeti';
const targetHost = 'ep-fancy-brook-b1nk9qf4.c-5.eu-central-1.aws.neon.tech';

export function selectContents(contents) {
  const selected = [];
  const excluded = [];
  for (const line of contents.split('\n')) {
    if (!line || line.startsWith(';')) continue;
    const match = line.match(/^\d+; \d+ \d+ (.+)$/);
    if (!match) throw new Error('Unrecognized archive entry.');
    const entry = match[1];
    const portable =
      /^(?:TYPE|FUNCTION|TABLE|TABLE DATA|SEQUENCE|SEQUENCE OWNED BY|SEQUENCE SET|DEFAULT|CONSTRAINT|FK CONSTRAINT|INDEX|TRIGGER|ROW SECURITY|POLICY|COMMENT) (auth|public|private|storage|supabase_migrations) /.test(
        entry,
      ) ||
      /^SCHEMA - (auth|extensions|private|storage|supabase_migrations) /.test(
        entry,
      ) ||
      /^EXTENSION - (pgcrypto|uuid-ossp)\s*$/.test(entry);
    (portable ? selected : excluded).push(line);
  }
  return { selected, excluded };
}

export function copyTables(sql) {
  const tables = [];
  const pattern =
    /^COPY ([a-z_][a-z0-9_]*\.[a-z_][a-z0-9_]*) \(([^\n]+)\) FROM stdin;\n([\s\S]*?)^\\\.\n/gm;
  for (const match of sql.matchAll(pattern)) {
    if (!schemas.includes(match[1].split('.')[0]))
      throw new Error('Unexpected data schema.');
    if (!/^(?:"?[a-z_][a-z0-9_]*"?)(?:, "?[a-z_][a-z0-9_]*"?)*$/.test(match[2]))
      throw new Error('Unexpected COPY columns.');
    const rows = match[3] ? match[3].slice(0, -1).split('\n') : [];
    tables.push({
      name: match[1],
      columns: match[2],
      rows: rows.length,
      sha256: hashRows(rows),
    });
  }
  if (
    !tables.some((table) => table.name === 'auth.users') ||
    !tables.some((table) => table.name === 'public.events')
  ) {
    throw new Error('Source COPY data is incomplete.');
  }
  return tables;
}

export function hashRows(rows) {
  return createHash('sha256')
    .update(JSON.stringify([...rows].sort()))
    .digest('hex');
}

async function main() {
  const [mode, argument] = process.argv.slice(2);
  if (
    !['--plan', '--apply'].includes(mode) ||
    !argument ||
    process.argv.length !== 4
  ) {
    throw new Error(
      'Usage: restore-source-staging.mjs --plan|--apply <private-backup-directory>',
    );
  }
  const directory = resolve(argument);
  if ((await stat(directory)).mode & 0o077)
    throw new Error('Backup directory must be private.');
  process.umask(0o077);
  const envFile = resolve('.env.migration.local');
  if ((await stat(envFile)).mode & 0o077)
    throw new Error('Migration environment must be private.');
  process.loadEnvFile(envFile);
  const url = new URL(process.env.NEON_MIGRATION_DATABASE_URL);
  // The connector returns a pooled hostname; migrations use its direct endpoint.
  url.hostname = url.hostname.replace('-pooler.', '.');
  if (
    url.hostname !== targetHost ||
    url.pathname !== '/myevents' ||
    url.username !== 'myevents_owner' ||
    !url.password ||
    !['postgres:', 'postgresql:'].includes(url.protocol) ||
    (url.port && url.port !== '5432') ||
    !['require', 'verify-full'].includes(url.searchParams.get('sslmode'))
  ) {
    throw new Error(
      'Refusing a destination other than the authorized migration-staging database.',
    );
  }
  const env = {
    PATH: process.env.PATH,
    PGHOST: url.hostname,
    PGPORT: '5432',
    PGUSER: decodeURIComponent(url.username),
    PGPASSWORD: decodeURIComponent(url.password),
    PGDATABASE: 'myevents',
    PGSSLMODE: url.searchParams.get('sslmode'),
    PGCONNECT_TIMEOUT: '15',
    PGOPTIONS:
      '-c statement_timeout=120000 -c timezone=UTC -c datestyle=ISO,MDY -c extra_float_digits=3',
  };
  const pg = (name) =>
    process.env.PG_BIN ? join(process.env.PG_BIN, name) : name;
  const options = { env, maxBuffer: 64 * 1024 * 1024, timeout: 15 * 60 * 1000 };
  const archive = join(directory, 'source.dump');
  const manifest = JSON.parse(
    await readFile(join(directory, 'manifest.json'), 'utf8'),
  );
  const archiveHash = createHash('sha256')
    .update(await readFile(archive))
    .digest('hex');
  if (
    manifest.source_project !== sourceProject ||
    manifest.sha256 !== archiveHash
  ) {
    throw new Error('Source archive identity or checksum mismatch.');
  }
  const { stdout: contents } = await run(
    pg('pg_restore'),
    ['--list', archive],
    options,
  );
  const { selected, excluded } = selectContents(contents);
  const selection = join(directory, 'neon-selection.txt');
  await writeFile(selection, selected.join('\n') + '\n', { mode: 0o600 });
  await writeFile(
    join(directory, 'neon-excluded.txt'),
    excluded.join('\n') + '\n',
    { mode: 0o600 },
  );
  const { stdout: sql } = await run(
    pg('pg_restore'),
    ['--no-owner', '--no-acl', '--use-list', selection, '--file=-', archive],
    options,
  );
  const tables = copyTables(sql);
  const dataEntries = selected.filter((entry) => / TABLE DATA /.test(entry));
  if (
    tables.length !== dataEntries.length ||
    new Set(tables.map((table) => table.name)).size !== tables.length
  ) {
    throw new Error('Not every selected table has verifiable COPY data.');
  }
  const plan = {
    source_sha256: archiveHash,
    target_branch: 'br-steep-firefly-b1trn4br',
    target_host: targetHost,
    selected_entries: selected.length,
    excluded_entries: excluded.length,
    tables,
  };
  await writeFile(
    join(directory, 'neon-restore-plan.json'),
    JSON.stringify(plan, null, 2) + '\n',
    { mode: 0o600 },
  );
  if (mode === '--plan') {
    console.log(
      `Restore plan saved privately: ${tables.length} tables, ${selected.length} selected entries, ${excluded.length} preserved only in source archive.`,
    );
    return;
  }
  const lockedSchemas = [...schemas, 'extensions'].join(', ');
  const guards = `
DO $guard$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname IN ('auth','public','private','storage','supabase_migrations'))
  OR EXISTS (SELECT FROM pg_namespace WHERE nspname IN ('auth','private','storage','supabase_migrations'))
  OR EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated')
  THEN RAISE EXCEPTION 'Staging is not empty; refusing to overwrite'; END IF;
END $guard$;
CREATE ROLE authenticated NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
`;
  const lockdown = `
REVOKE ALL ON SCHEMA ${lockedSchemas} FROM PUBLIC, authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA ${lockedSchemas} FROM PUBLIC, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA ${lockedSchemas} FROM PUBLIC, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA ${lockedSchemas} FROM PUBLIC, authenticated;
`;
  const restoreFile = join(directory, 'neon-restore.sql');
  await writeFile(
    restoreFile,
    `\\set ON_ERROR_STOP on\nBEGIN;\n${guards}\n${sql}\n${lockdown}\nCOMMIT;\n`,
    { mode: 0o600 },
  );
  try {
    await run(
      pg('psql'),
      ['-X', '--no-password', '-q', '-v', 'ON_ERROR_STOP=1', '-f', restoreFile],
      options,
    );
    for (const table of tables) {
      const { stdout } = await run(
        pg('psql'),
        [
          '-X',
          '--no-password',
          '-qAt',
          '-v',
          'ON_ERROR_STOP=1',
          '-c',
          `COPY (SELECT ${table.columns} FROM ${table.name}) TO STDOUT;`,
        ],
        {
          ...options,
          env: {
            ...env,
            PGOPTIONS: env.PGOPTIONS + ' -c default_transaction_read_only=on',
          },
        },
      );
      const rows = stdout ? stdout.slice(0, -1).split('\n') : [];
      if (rows.length !== table.rows || hashRows(rows) !== table.sha256) {
        throw new Error(`Restored data mismatch for ${table.name}.`);
      }
    }
    const evidence = {
      ...plan,
      verified_at: new Date().toISOString(),
      status: 'legacy_data_restored_and_compared',
      limitations:
        'Neon Auth, application adapters, external service configuration and live sessions are not migrated.',
    };
    await writeFile(
      join(directory, 'neon-restore-verified.json'),
      JSON.stringify(evidence, null, 2) + '\n',
      { mode: 0o600 },
    );
    console.log(
      `Legacy staging restoration verified: ${tables.length} table counts and row checksums match the archive. Application migration remains pending.`,
    );
  } catch (error) {
    await writeFile(
      join(directory, 'neon-restore-failure.log'),
      error.stderr || error.message,
      { mode: 0o600 },
    );
    throw new Error(
      'Staging restoration is not verified. See the private neon-restore-failure.log.',
    );
  }
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch(() => {
    console.error(
      'Restore command failed; inspect private backup evidence and configuration. No success is claimed.',
    );
    process.exitCode = 1;
  });
}
