import { test, expect } from '@playwright/test';

test('has title and foundation text', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('text="MyEvent\'s"')).toBeVisible();
  await expect(
    page.locator('text="Fondation locale opérationnelle"'),
  ).toBeVisible();
});
