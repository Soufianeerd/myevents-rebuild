import { afterEach, beforeEach, expect, it } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);
const script = resolve('scripts/migration/backup-source.mjs');
const ref = 'cipzwuurweaeohgxzeti';
let directory: string;
beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'myevents-source-config-'));
});
afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});
function check(url: string, password = 'synthetic-password-never-print') {
  return run(process.execPath, [script, '--validate-config'], {
    cwd: directory,
    env: {
      ...process.env,
      SUPABASE_SOURCE_DATABASE_URL: url,
      SUPABASE_SOURCE_DATABASE_PASSWORD: password,
    },
  });
}
it('accepts the authorized direct and session connections without exposing passwords', async () => {
  for (const url of [
    `postgresql://postgres@db.${ref}.supabase.co:5432/postgres?sslmode=require`,
    `postgresql://postgres.${ref}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=verify-full`,
  ]) {
    const output = await check(url);
    expect(output.stdout).toContain('no connection opened');
    expect(output.stdout + output.stderr).not.toContain('synthetic-password');
  }
});
it('refuses other projects, transaction pooling, insecure TLS and connection overrides', async () => {
  const valid = `postgresql://postgres@db.${ref}.supabase.co:5432/postgres?sslmode=require`;
  for (const url of [
    valid.replace(ref, 'another-project'),
    valid.replace('5432', '6543'),
    valid.replace('require', 'disable'),
    `${valid}&host=unrelated.example`,
    `${valid}&sslmode=disable`,
    valid.replace('/postgres?', '/another_database?'),
    'not-a-url',
  ]) {
    await expect(check(url)).rejects.toMatchObject({ code: 1 });
  }
});
it('refuses missing passwords and readable-by-others environment files', async () => {
  const url = `postgresql://postgres@db.${ref}.supabase.co:5432/postgres?sslmode=require`;
  await expect(check(url, '')).rejects.toMatchObject({ code: 1 });
  await writeFile(join(directory, '.env.migration.local'), '# no secrets\n', {
    mode: 0o644,
  });
  await expect(check(url)).rejects.toMatchObject({ code: 1 });
});
