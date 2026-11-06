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
// Stripe Test is optional: only test-mode keys and a strong fulfillment secret
// are forwarded. Live keys are refused before the server starts.
let payments = {};
try {
  if ((await stat('.env.payments.local')).mode & 0o077)
    throw new Error('Payment configuration must have permissions 0600.');
  const values = parseEnv(await readFile('.env.payments.local', 'utf8'));
  if (
    values.STRIPE_SECRET_KEY &&
    !/^(sk|rk)_test_/.test(values.STRIPE_SECRET_KEY)
  )
    throw new Error('Only Stripe Test keys are accepted locally.');
  payments = Object.fromEntries(
    ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'PAYMENT_FULFILLMENT_SECRET']
      .filter((key) => values[key])
      .map((key) => [key, values[key]]),
  );
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
let operator = {};
try {
  if ((await stat('.env.operator.local')).mode & 0o077)
    throw new Error('Operator configuration must have permissions 0600.');
  const values = parseEnv(await readFile('.env.operator.local', 'utf8'));
  operator = Object.fromEntries(
    ['OPERATOR_SECRET', 'OPERATOR_EMAILS']
      .filter((key) => values[key])
      .map((key) => [key, values[key]]),
  );
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
    env: {
      ...process.env,
      ...config,
      ...media,
      ...payments,
      ...operator,
      BUSINESS_PREVIEW: 'true',
    },
  },
);
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => child.kill(signal));
child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
