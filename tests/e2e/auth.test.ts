import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const randomSuffix = Math.floor(Math.random() * 100000);
  const email = `test.user.${randomSuffix}@example.com`;
  const password = 'StrongPassword123!';
  const newPassword = 'NewStrongPassword456!';

  test('should register a new user, log out, and log back in', async ({
    page,
  }) => {
    // 1. Register
    await page.goto('/inscription');
    await page.fill('input[name="displayName"]', 'Test User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');

    // Verify user menu
    await page.click('button[aria-label="Menu utilisateur"]');
    await expect(page.getByText('Test User')).toBeVisible();

    // 2. Logout
    await page.click('text=Déconnexion');
    await expect(page).toHaveURL(/.*\/connexion/);

    // 3. Invalid Login
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'WrongPassword!');
    await page.click('button[type="submit"]');
    await expect(
      page.getByText('Adresse e-mail ou mot de passe incorrect.'),
    ).toBeVisible();

    // 4. Valid Login
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should request password reset and use token to reset', async ({
    page,
  }) => {
    // We assume the user from previous test exists. Since Playwright runs tests in parallel by default,
    // it's safer to create a new user or rely on the previous one only if running serially.
    // We'll create a completely new user specifically for reset.
    const resetEmail = `reset.${randomSuffix}@example.com`;

    // Setup user
    await page.goto('/inscription');
    await page.fill('input[name="displayName"]', 'Reset User');
    await page.fill('input[name="email"]', resetEmail);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
    await page.click('button[aria-label="Menu utilisateur"]');
    await page.click('text=Déconnexion');

    // Request Reset
    await page.goto('/mot-de-passe-oublie');
    await page.fill('input[name="email"]', resetEmail);
    await page.click('button[type="submit"]');

    await expect(page.getByText('Vérifiez votre e-mail')).toBeVisible();

    // Check Mailbox
    await page.goto('/dev/mailbox');
    await expect(page.getByText(resetEmail)).toBeVisible();

    // Get the reset link from the page text
    const content = await page.innerText('body');
    const resetLinkMatch = content.match(
      /http:\/\/localhost:3000\/reinitialiser-mot-de-passe\?token=([a-zA-Z0-9_-]+)/,
    );
    expect(resetLinkMatch).not.toBeNull();
    const resetLink = resetLinkMatch![0];

    // Reset Password
    await page.goto(resetLink);
    await page.fill('input[name="password"]', newPassword);
    await page.click('button[type="submit"]');

    await expect(page.getByText('Mot de passe mis à jour')).toBeVisible();
    await page.click('text=Se connecter');

    // Login with new password
    await page.fill('input[name="email"]', resetEmail);
    await page.fill('input[name="password"]', newPassword);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/dashboard/);
  });
});
