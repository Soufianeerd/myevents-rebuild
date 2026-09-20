import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/neon-ui',
  workers: 1,
  retries: 0,
  timeout: 60000,
  use: { baseURL: 'http://localhost:3300', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
