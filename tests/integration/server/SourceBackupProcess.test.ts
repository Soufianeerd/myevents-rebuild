import { afterEach, beforeEach, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);
const script = resolve('scripts/migration/backup-source.mjs');
const snapshot = '00000003-0000001B-1';
const secret = 'synthetic-backup-password';
let directory: string;

// Substitute the PostgreSQL executables at the process boundary. These tests
// exercise orchestration and file publication, not PostgreSQL restore semantics.
beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'myevents-backup-process-'));
  await mkdir(join(directory, 'bin'));
  await writeFile(
    join(directory, 'isolate-home.mjs'),
    `
    import os from 'node:os';
    import { syncBuiltinESMExports } from 'node:module';
    os.homedir = () => process.env.BACKUP_TEST_DIRECTORY;
    syncBuiltinESMExports();
  `,
  );
  const fixture = String.raw`#!${process.execPath}
    const fs = require('node:fs');
    const path = require('node:path');
    const name = path.basename(process.argv[1]);
    const args = process.argv.slice(2);
    const root = process.env.BACKUP_TEST_DIRECTORY;
    const mode = process.env.BACKUP_TEST_MODE;
    if (process.env.PGHOST !== 'db.cipzwuurweaeohgxzeti.supabase.co' ||
        process.env.PGDATABASE !== 'postgres' || process.env.PGPORT !== '5432' ||
        process.env.PGUSER !== 'postgres' || process.env.PGPASSWORD !== '${secret}' ||
        process.env.PGSSLMODE !== 'require') process.exit(3);
    fs.appendFileSync(path.join(root, 'calls.jsonl'), JSON.stringify({name, args, options: process.env.PGOPTIONS}) + '\n');
    if (name === 'pg_dump' && args.includes('--version')) {
      console.log('pg_dump (PostgreSQL) ' + (mode === 'old-client' ? '14.0' : '18.3'));
    } else if (name === 'psql') {
      let input = '';
      let sentInventory = false;
      process.stdin.on('data', (chunk) => {
        input += chunk;
        fs.writeFileSync(path.join(root, 'session.sql'), input);
        if (input.includes('pg_export_snapshot()') && !fs.existsSync(path.join(root, 'snapshot-open'))) {
          fs.writeFileSync(path.join(root, 'snapshot-open'), 'yes');
          console.log('${snapshot}');
        }
        if (input.includes('jsonb_build_object') && !sentInventory) {
          sentInventory = true;
          console.log(JSON.stringify({server_version:'17.6', events:2, auth_users:1}));
        }
      });
    } else if (name === 'pg_dump') {
      if (!fs.existsSync(path.join(root, 'snapshot-open')) || !args.includes('--snapshot=${snapshot}')) process.exit(2);
      fs.writeFileSync(args.find(arg => arg.startsWith('--file=')).slice(7), 'synthetic archive');
      if (mode === 'dump-failure') { console.error('${secret}'); process.exit(1); }
    } else if (name === 'pg_restore') {
      const tables = ['public events', 'public sub_events', 'public organizations',
        'public organization_memberships', 'private audit_logs', 'private jobs',
        'private webhook_events', 'auth users', 'auth identities', 'storage buckets',
        'storage objects', 'supabase_migrations schema_migrations'];
      tables.filter(t => mode !== 'missing-auth' || t !== 'auth users').forEach((t, i) => console.log((i+1) + '; 0 1 TABLE DATA ' + t + ' postgres'));
    }
  `;
  for (const binary of ['psql', 'pg_dump', 'pg_restore']) {
    await writeFile(join(directory, 'bin', binary), fixture, { mode: 0o700 });
  }
});

afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

function backup(mode = 'success') {
  return run(
    process.execPath,
    ['--import', join(directory, 'isolate-home.mjs'), script],
    {
      cwd: directory,
      env: {
        NODE_ENV: 'test',
        PATH: process.env.PATH,
        PG_BIN: join(directory, 'bin'),
        BACKUP_TEST_DIRECTORY: directory,
        BACKUP_TEST_MODE: mode,
        SUPABASE_SOURCE_DATABASE_URL:
          'postgresql://postgres@db.cipzwuurweaeohgxzeti.supabase.co:5432/postgres?sslmode=require',
        SUPABASE_SOURCE_DATABASE_PASSWORD: secret,
      },
      timeout: 10000,
    },
  );
}

async function archiveDirectory() {
  const root = join(directory, '.local/share/myevents/migrations');
  const entries = await readdir(root);
  expect(entries).toHaveLength(1);
  return join(root, entries[0]);
}

it('publishes private archive evidence with a matching hash and shared read-only snapshot', async () => {
  const output = await backup();
  const archive = await archiveDirectory();
  const manifest = JSON.parse(
    await readFile(join(archive, 'manifest.json'), 'utf8'),
  );
  const bytes = await readFile(join(archive, 'source.dump'));
  expect(manifest).toMatchObject({
    snapshot,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    inventory: { events: 2, auth_users: 1 },
    status: 'archive_created_not_yet_restored',
  });
  expect(await readdir(archive)).toEqual([
    'contents.txt',
    'manifest.json',
    'source.dump',
  ]);
  expect((await stat(archive)).mode & 0o777).toBe(0o700);
  for (const file of await readdir(archive)) {
    expect((await stat(join(archive, file))).mode & 0o777).toBe(0o600);
  }
  const sql = await readFile(join(directory, 'session.sql'), 'utf8');
  expect(sql).toContain('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  const calls = (await readFile(join(directory, 'calls.jsonl'), 'utf8'))
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line));
  expect(
    calls.every((call) =>
      call.options.includes('default_transaction_read_only=on'),
    ),
  ).toBe(true);
  expect(
    calls.find(
      (call) =>
        call.name === 'pg_dump' && call.args.includes('--format=custom'),
    ).args,
  ).toContain('--snapshot=' + snapshot);
  expect(calls.find((call) => call.name === 'psql').args).toContain(
    '--no-password',
  );
  expect(JSON.stringify(calls) + output.stdout + output.stderr).not.toContain(
    secret,
  );
});

it.each(['dump-failure', 'missing-auth', 'old-client'])(
  'does not publish a success manifest after %s',
  async (mode) => {
    await expect(backup(mode)).rejects.toMatchObject({
      code: 1,
      stdout: '',
      stderr: expect.stringContaining('Backup incomplete.'),
    });
    const archive = await archiveDirectory();
    const files = await readdir(archive);
    expect(files).toContain('failure.log');
    expect(files).not.toContain('manifest.json');
    expect(files).not.toContain('source.dump');
    expect((await stat(join(archive, 'failure.log'))).mode & 0o777).toBe(0o600);
    if (mode === 'dump-failure') {
      expect(await readFile(join(archive, 'failure.log'), 'utf8')).toContain(
        secret,
      );
    }
    if (mode === 'old-client') {
      expect(
        await readFile(join(directory, 'calls.jsonl'), 'utf8'),
      ).not.toContain('--format=custom');
    }
  },
);
