import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const dataDir = await mkdtemp(join(tmpdir(), 'myevents-e2e-'));
const env = { ...process.env, E2E_DATA_DIR: dataDir };
const run = (args) =>
  new Promise((resolve, reject) => {
    const child = spawn('corepack', ['pnpm', ...args], {
      stdio: 'inherit',
      env,
    });
    child.on('error', reject);
    child.on('exit', (code) => resolve(code ?? 1));
  });
try {
  const build = await run(['build']);
  process.exitCode =
    build ||
    (await run(['exec', 'playwright', 'test', ...process.argv.slice(2)]));
} finally {
  await rm(dataDir, { recursive: true, force: true });
}
