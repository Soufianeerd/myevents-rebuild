import { readFile, stat } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import { spawn } from 'node:child_process';
const filename = '.env.neon.local';
if ((await stat(filename)).mode & 0o077)
  throw new Error('Neon configuration must have permissions 0600.');
const config = parseEnv(await readFile(filename, 'utf8'));
if (
  config.APP_MODE !== 'connected' ||
  config.CONNECTED_PROVIDER !== 'neon' ||
  config.APP_URL !== 'http://localhost:3300'
)
  throw new Error('Expected the local Neon staging configuration.');
let media = {};
try {
  if ((await stat('.env.media.local')).mode & 0o077)
    throw new Error(
      'Private storage configuration must have permissions 0600.',
    );
  const storage = parseEnv(await readFile('.env.media.local', 'utf8'));
  media = {
    NEON_STORAGE_ENDPOINT: storage.AWS_ENDPOINT_URL_S3,
    NEON_STORAGE_REGION: storage.AWS_REGION,
    NEON_STORAGE_ACCESS_KEY_ID: storage.AWS_ACCESS_KEY_ID,
    NEON_STORAGE_SECRET_ACCESS_KEY: storage.AWS_SECRET_ACCESS_KEY,
    NEON_STORAGE_BUCKET: storage.MEDIA_BUCKET,
  };
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const child = spawn(
  process.execPath,
  [
    'node_modules/next/dist/bin/next',
    'dev',
    '--hostname',
    '127.0.0.1',
    '--port',
    '3300',
  ],
  {
    stdio: 'inherit',
    env: { ...process.env, ...config, ...media, BUSINESS_PREVIEW: 'true' },
  },
);
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => child.kill(signal));
child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
