import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.E2E_PORT || 3200);
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw new Error('Invalid E2E_PORT');
const dataDir = process.env.E2E_DATA_DIR;
if (!dataDir)
  throw new Error('Run corepack pnpm test:e2e to create isolated test data.');
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `corepack pnpm start --hostname 127.0.0.1 --port ${port}`,
    url: baseURL,
    env: {
      APP_MODE: 'local',
      APP_URL: baseURL,
      LOCAL_DATA_DIR: dataDir,
      BUSINESS_PREVIEW: 'true',
    },
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
