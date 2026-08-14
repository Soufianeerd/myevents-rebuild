import { test, expect } from '@playwright/test';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

test.describe('Data Isolation', () => {
  test('should use LOCAL_DATA_DIR for persistence instead of default .data', async ({
    page,
  }) => {
    // 1. Ensure .data-e2e exists and clean up a specific test user
    const dataDir = path.resolve(process.cwd(), '.data-e2e');
    const defaultDataDir = path.resolve(process.cwd(), '.data');

    // 2. Register a new user
    const randomSuffix = Math.floor(Math.random() * 100000);
    const email = `isolation.${randomSuffix}@example.com`;

    await page.goto('/inscription');
    await page.fill('input[name="firstName"]', 'Isolation');
    await page.fill('input[name="lastName"]', 'Test');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'StrongPassword123!AndVeryLong');
    await page.fill(
      'input[name="passwordConfirmation"]',
      'StrongPassword123!AndVeryLong',
    );
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

    // 3. Verify that the user exists in .data-e2e/users.json
    const e2eUsersFile = path.join(dataDir, 'users.json');
    const e2eUsersContent = await fs.readFile(e2eUsersFile, 'utf-8');
    expect(e2eUsersContent).toContain(email);

    // 4. Verify that .data/users.json (if it exists) does NOT contain the user
    try {
      const defaultUsersFile = path.join(defaultDataDir, 'users.json');
      const defaultUsersContent = await fs.readFile(defaultUsersFile, 'utf-8');
      expect(defaultUsersContent).not.toContain(email);
    } catch (error: unknown) {
      // If .data/users.json doesn't exist, that's also fine!
      expect((error as NodeJS.ErrnoException).code).toBe('ENOENT');
    }
  });
});
