import { afterEach, beforeEach, expect, it } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);
const script = resolve('scripts/check-server-traces.mjs');
let dir: string;
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'myevents-traces-'));
  await mkdir(join(dir, '.next/server/app'), { recursive: true });
});
afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});
async function trace(files: string[]) {
  await writeFile(
    join(dir, '.next/server/app/page.js.nft.json'),
    JSON.stringify({ version: 1, files }),
  );
}
it('allows framework assets and refuses local mail, credentials and test reports', async () => {
  await trace([
    '../../../node_modules/next/server.js',
    '../../../public/fonts/inter.woff2',
  ]);
  await expect(
    run(process.execPath, [script], { cwd: dir }),
  ).resolves.toBeDefined();
  for (const file of [
    '.data/mail/reset.txt',
    '.data-e2e/users.json',
    '.env.local',
    'playwright-report/index.html',
    'docs/myevents/Archive.zip',
  ]) {
    await trace([`../../../${file}`]);
    await expect(
      run(process.execPath, [script], { cwd: dir }),
    ).rejects.toMatchObject({ code: 1 });
  }
});
