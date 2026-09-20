// Full PostgreSQL archive from the explicitly authorized Supabase source.
// No destination writes; no credentials in argv, output, or committed files.
import { spawn, execFile } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { mkdir, writeFile, rename } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { createInterface } from 'node:readline';
import { promisify } from 'node:util';

const run = promisify(execFile);
const project = 'cipzwuurweaeohgxzeti';
const expectedTables = [
  'public events',
  'public sub_events',
  'public organizations',
  'public organization_memberships',
  'private audit_logs',
  'private jobs',
  'private webhook_events',
  'auth users',
  'auth identities',
  'storage buckets',
  'storage objects',
  'supabase_migrations schema_migrations',
];

function sourceConnection() {
  let url;
  try {
    url = new URL(process.env.SUPABASE_SOURCE_DATABASE_URL);
  } catch {
    throw new Error('SUPABASE_SOURCE_DATABASE_URL is missing or invalid.');
  }
  const direct =
    url.hostname === `db.${project}.supabase.co` &&
    decodeURIComponent(url.username) === 'postgres';
  const session =
    url.hostname === 'aws-0-eu-west-1.pooler.supabase.com' &&
    decodeURIComponent(url.username) === `postgres.${project}`;
  if (
    !['postgres:', 'postgresql:'].includes(url.protocol) ||
    (!direct && !session) ||
    (url.port && url.port !== '5432') ||
    url.pathname !== '/postgres' ||
    url.hash
  ) {
    throw new Error(
      'Refusing an unexpected source project or transaction pooler.',
    );
  }
  if (
    url.searchParams.getAll('sslmode').length !== 1 ||
    !['require', 'verify-ca', 'verify-full'].includes(
      url.searchParams.get('sslmode'),
    ) ||
    [...url.searchParams.keys()].some((key) => key !== 'sslmode')
  ) {
    throw new Error(
      'Source connection must use TLS and only the sslmode option.',
    );
  }
  if (!url.password && process.env.SUPABASE_SOURCE_DATABASE_PASSWORD) {
    url.password = encodeURIComponent(
      process.env.SUPABASE_SOURCE_DATABASE_PASSWORD,
    );
  }
  if (
    !url.password ||
    /YOUR-PASSWORD|REPLACE_ME/.test(decodeURIComponent(url.password))
  ) {
    throw new Error('The existing source database password is still missing.');
  }
  return url.toString();
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length && !(args.length === 1 && args[0] === '--validate-config')) {
    throw new Error('Unknown backup argument.');
  }
  const envFile = resolve('.env.migration.local');
  if (existsSync(envFile)) {
    if ((statSync(envFile).mode & 0o077) !== 0) {
      throw new Error('Private environment file requires permissions 0600.');
    }
    process.loadEnvFile(envFile);
  }
  const connection = new URL(sourceConnection());
  if (args[0] === '--validate-config') {
    console.log(
      `Source configuration valid for ${project}; no connection opened.`,
    );
    return;
  }

  const pg = (name) =>
    process.env.PG_BIN ? join(process.env.PG_BIN, name) : name;
  const env = Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) => !key.startsWith('PG') && !key.startsWith('SUPABASE_'),
    ),
  );
  Object.assign(env, {
    PGHOST: connection.hostname,
    PGPORT: connection.port || '5432',
    PGUSER: decodeURIComponent(connection.username),
    PGPASSWORD: decodeURIComponent(connection.password),
    PGDATABASE: connection.pathname.slice(1),
    PGSSLMODE: connection.searchParams.get('sslmode'),
    PGCONNECT_TIMEOUT: '10',
    PGOPTIONS: '-c default_transaction_read_only=on -c statement_timeout=30000',
  });
  const { stdout: version } = await run(pg('pg_dump'), ['--version'], { env });
  const clientMajor = Number(version.match(/PostgreSQL\) (\d+)/)?.[1]);
  if (!clientMajor) throw new Error('Unable to identify pg_dump version.');

  process.umask(0o077);
  const directory = join(
    homedir(),
    '.local/share/myevents/migrations',
    `${new Date().toISOString().replaceAll(':', '-')}-${randomUUID()}`,
  );
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const session = spawn(
    pg('psql'),
    ['-X', '--no-password', '-qAt', '-v', 'ON_ERROR_STOP=1'],
    {
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
    },
  );
  let stderr = '';
  session.stderr.on('data', (chunk) => (stderr += chunk));
  const ended = new Promise((_, reject) => {
    session.once('error', () => reject(new Error('Unable to open psql.')));
    session.once('exit', () => reject(new Error('Source SQL session ended.')));
  });
  // The session is intentionally held open while pg_dump imports its snapshot.
  ended.catch(() => {});
  const lines = createInterface({ input: session.stdout })[
    Symbol.asyncIterator
  ]();
  async function line() {
    let timer;
    try {
      const result = await Promise.race([
        lines.next(),
        ended,
        new Promise((_, reject) => {
          timer = setTimeout(
            () => reject(new Error('Source query timed out.')),
            45000,
          );
        }),
      ]);
      if (result.done) throw new Error('No source result.');
      return result.value;
    } finally {
      clearTimeout(timer);
    }
  }
  try {
    session.stdin.write(
      'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY; SELECT pg_export_snapshot();\n',
    );
    const snapshot = await line();
    if (!/^[0-9A-Fa-f-]+$/.test(snapshot)) {
      throw new Error('Unexpected PostgreSQL snapshot identifier.');
    }
    session.stdin.write(`SELECT jsonb_build_object(
      'server_version',current_setting('server_version'),
      'database_bytes',pg_database_size(current_database()),
      'events',(SELECT count(*) FROM public.events),
      'sub_events',(SELECT count(*) FROM public.sub_events),
      'organizations',(SELECT count(*) FROM public.organizations),
      'organization_memberships',(SELECT count(*) FROM public.organization_memberships),
      'audit_logs',(SELECT count(*) FROM private.audit_logs),
      'jobs',(SELECT count(*) FROM private.jobs),
      'webhook_events',(SELECT count(*) FROM private.webhook_events),
      'auth_users',(SELECT count(*) FROM auth.users),
      'auth_identities',(SELECT count(*) FROM auth.identities),
      'storage_buckets',(SELECT count(*) FROM storage.buckets),
      'storage_objects',(SELECT count(*) FROM storage.objects),
      'migrations',(SELECT count(*) FROM supabase_migrations.schema_migrations)
    );\n`);
    const inventory = JSON.parse(await line());
    if (clientMajor < Number(inventory.server_version.split('.')[0])) {
      throw new Error(
        'pg_dump is older than the source; select a newer PG_BIN.',
      );
    }
    const partial = join(directory, 'source.dump.partial');
    await run(
      pg('pg_dump'),
      [
        '--no-password',
        '--format=custom',
        `--snapshot=${snapshot}`,
        `--file=${partial}`,
      ],
      { env, maxBuffer: 1024 * 1024, timeout: 15 * 60 * 1000 },
    );
    const { stdout: contents } = await run(
      pg('pg_restore'),
      ['--list', partial],
      {
        env,
        maxBuffer: 10 * 1024 * 1024,
      },
    );
    const archivedTables = new Set(
      contents.split('\n').flatMap((entry) => {
        const match = entry.match(/^\d+; \d+ \d+ TABLE DATA (\S+ \S+) /);
        return match ? [match[1]] : [];
      }),
    );
    if (expectedTables.some((table) => !archivedTables.has(table))) {
      throw new Error('Archive does not contain all expected source tables.');
    }
    const hash = createHash('sha256');
    for await (const chunk of createReadStream(partial)) hash.update(chunk);
    const archive = join(directory, 'source.dump');
    await rename(partial, archive);
    await writeFile(join(directory, 'contents.txt'), contents, { mode: 0o600 });
    await writeFile(
      join(directory, 'manifest.json'),
      JSON.stringify(
        {
          source_project: project,
          exported_at: new Date().toISOString(),
          snapshot,
          client_version: version.trim(),
          sha256: hash.digest('hex'),
          inventory,
          status: 'archive_created_not_yet_restored',
          scope:
            'PostgreSQL database; storage bytes and external service configuration are separate',
        },
        null,
        2,
      ) + '\n',
      { mode: 0o600 },
    );
    console.log(
      `Source archive and snapshot manifest saved privately to ${directory}`,
    );
    console.log(
      'Archive created. Restoration and migration are not yet verified.',
    );
  } catch (error) {
    // Driver failures can contain private database details: keep diagnostics local.
    await writeFile(
      join(directory, 'failure.log'),
      `${stderr}\n${error.stderr || error.message}\n`,
      { mode: 0o600 },
    );
    throw new Error(
      `Backup incomplete. Private diagnostics: ${directory}/failure.log`,
    );
  } finally {
    session.stdin.end('ROLLBACK;\n\\q\n');
    session.kill();
  }
}

main().catch((error) => {
  // Only our fixed configuration/failure messages are safe to print.
  const message = error.message.startsWith('Command failed:')
    ? 'PostgreSQL client failed. Check PG_BIN and local access.'
    : error.message;
  console.error(message);
  process.exitCode = 1;
});
