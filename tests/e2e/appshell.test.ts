import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('AppShell - Session 02', () => {
  test.beforeEach(async ({ page }) => {
    const suffix = Math.floor(Math.random() * 1000000);
    const email = `appshell.${suffix}@example.com`;
    await page.goto('/inscription');
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'SecurePassword123!AndVeryLong');
    await page.fill(
      'input[name="passwordConfirmation"]',
      'SecurePassword123!AndVeryLong',
    );
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('Desktop layout displays sidebar and topbar', async ({ page }) => {
    // Set viewport to desktop
    await page.setViewportSize({ width: 1440, height: 1000 });

    // Check that sidebar is visible
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
    await expect(sidebar).toHaveText(/Gestion/);

    // Check topbar search exists
    const search = page.locator('text=Rechercher...');
    await expect(search).toBeVisible();

    // Check a11y
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);

    // Golden snapshot for appshell desktop
    await expect(page).toHaveScreenshot('appshell-desktop-baseline.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.01, // Allow 1% difference for anti-aliasing
    });
  });

  test('Mobile layout displays hamburger menu and drawer', async ({ page }) => {
    // Set viewport to mobile
    await page.setViewportSize({ width: 390, height: 844 });

    // Check that sidebar is hidden by default
    const sidebar = page.locator('aside').first();
    await expect(sidebar).toBeHidden();

    // Focus and press enter on hamburger to ensure Radix captures focus origin
    const hamburger = page.locator('button[aria-label="Ouvrir le menu"]');
    await expect(hamburger).toBeVisible();
    await hamburger.focus();
    await hamburger.press('Enter');

    const drawer = page.locator('[role="dialog"]');
    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveText(/Gestion/);

    // Check a11y on opened drawer
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);

    // Check escape closes it
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();

    // Check focus returns to trigger
    await expect(hamburger).toBeFocused();
  });

  test('SkipLink functionality', async ({ page }) => {
    const skipLink = page.locator('a[href="#main-content"]');
    await skipLink.focus();
    await expect(skipLink).toBeFocused();
    await skipLink.press('Enter');
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeFocused();
  });

  test('UserMenu keyboard navigation', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });

    const trigger = page.locator('button[aria-label="Menu utilisateur"]');
    await expect(trigger).toBeVisible();

    // Open via keyboard
    await trigger.focus();
    await page.keyboard.press('Enter');

    const menu = page.locator('[role="menu"]');
    await expect(menu).toBeVisible();

    // Radix DropdownMenu auto-focuses the first item when opened via keyboard
    const firstItem = page.locator('[role="menuitem"]').first();
    await expect(firstItem).toBeFocused();

    // Move focus inside to second item
    await page.keyboard.press('ArrowDown');
    const secondItem = page.locator('[role="menuitem"]').nth(1);
    await expect(secondItem).toBeFocused();

    // Close with Escape
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();

    // Focus should return to trigger
    await expect(trigger).toBeFocused();
  });
});
