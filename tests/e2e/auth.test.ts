import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Authentication & Security Flow', () => {
  const randomSuffix = Math.floor(Math.random() * 100000);
  const email = `test.user.${randomSuffix}@example.com`;
  const password = 'StrongPassword123!AndVeryLong';
  const newPassword = 'NewStrongPassword456!AndVeryLong';

  test('should register a new user, check a11y, log out, and log back in', async ({
    page,
  }) => {
    // 1. Register page a11y
    await page.goto('/inscription');
    await page.waitForLoadState('networkidle');
    const a11yRegister = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();
    expect(
      a11yRegister.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical',
      ),
    ).toEqual([]);

    // Visual Snapshot for Registration (use mask for dynamic elements if any, here just check baseline)
    await expect(page).toHaveScreenshot('auth-signup-baseline.png', {
      maxDiffPixelRatio: 0.05,
    });

    // Register
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="passwordConfirmation"]', password);
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

    // Verify user menu
    await page.click('button[aria-label="Menu utilisateur"]');
    await expect(page.getByText('Test User')).toBeVisible();

    // 2. Logout
    await page.click('text=Déconnexion');
    await expect(page).toHaveURL(/.*\/connexion/);

    // Login page a11y
    await page.goto('/connexion');
    await page.waitForLoadState('networkidle');
    const a11yLogin = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();
    expect(
      a11yLogin.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical',
      ),
    ).toEqual([]);

    // Visual Snapshot for Login
    await expect(page).toHaveScreenshot('auth-login-baseline.png', {
      maxDiffPixelRatio: 0.05,
    });

    // 3. Valid Login
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

    // Cookie attributes check
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === 'myevents_session');
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie?.httpOnly).toBe(true);
    expect(sessionCookie?.sameSite).toBe('Lax');
    expect(sessionCookie?.path).toBe('/');

    // Logout again to test the failure cases
    await page.click('button[aria-label="Menu utilisateur"]');
    await page.click('text=Déconnexion');
    await expect(page).toHaveURL(/.*\/connexion/);

    // 4. Unknown email login
    await page.fill('input[name="email"]', 'unknown.user@example.com');
    await page.fill('input[name="password"]', 'WrongPassword!123456');
    await page.click('button[type="submit"]');
    await expect(
      page.getByText('Adresse e-mail ou mot de passe incorrect.'),
    ).toBeVisible();

    // 5. Wrong password login
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'WrongPassword!123456');
    await page.click('button[type="submit"]');
    await expect(
      page.getByText('Adresse e-mail ou mot de passe incorrect.'),
    ).toBeVisible();
  });

  test('should not allow duplicate email registration', async ({ page }) => {
    const duplicateEmail = `duplicate.${randomSuffix}@example.com`;

    // 1. Register first
    await page.goto('/inscription');
    await page.fill('input[name="firstName"]', 'First');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', duplicateEmail);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="passwordConfirmation"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    await page.click('button[aria-label="Menu utilisateur"]');
    await page.click('text=Déconnexion');

    // 2. Try to register again
    await page.goto('/inscription');
    await page.fill('input[name="firstName"]', 'Test2');
    await page.fill('input[name="lastName"]', 'User2');
    await page.fill('input[name="email"]', duplicateEmail);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="passwordConfirmation"]', password);
    await page.click('button[type="submit"]');

    await expect(
      page.getByText('Cette adresse e-mail est déjà utilisée.'),
    ).toBeVisible();
  });

  test('should request password reset and use token to reset', async ({
    page,
  }) => {
    const resetEmail = `reset.${randomSuffix}@example.com`;

    // Setup user
    await page.goto('/inscription');
    await page.fill('input[name="firstName"]', 'Reset');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', resetEmail);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="passwordConfirmation"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    await page.click('button[aria-label="Menu utilisateur"]');
    await page.click('text=Déconnexion');

    // Request Reset
    await page.goto('/mot-de-passe-oublie');
    await page.waitForLoadState('networkidle');

    const a11yForgot = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();
    expect(
      a11yForgot.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical',
      ),
    ).toEqual([]);

    // Visual Snapshot for Forgot Password
    await expect(page).toHaveScreenshot('auth-forgot-baseline.png', {
      maxDiffPixelRatio: 0.05,
    });

    await page.fill('input[name="email"]', resetEmail);
    await page.click('button[type="submit"]');
    await expect(page.getByText('Vérifiez votre e-mail')).toBeVisible();

    // Check Mailbox
    await page.goto('/dev/mailbox');
    await expect(page.getByText(resetEmail)).toBeVisible();

    // Get the reset link from the page text
    const content = await page.innerText('body');
    const resetLinkMatch = content.match(
      /http:\/\/(?:localhost|127\.0\.0\.1):3000\/reinitialiser-mot-de-passe\?token=([a-zA-Z0-9_-]+)/,
    );
    expect(resetLinkMatch).not.toBeNull();
    const resetLink = resetLinkMatch![0];

    // Reset Password page a11y
    await page.goto(resetLink);
    await page.waitForLoadState('networkidle');
    const a11yReset = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();
    expect(
      a11yReset.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical',
      ),
    ).toEqual([]);

    await page.fill('input[name="password"]', newPassword);
    await page.click('button[type="submit"]');

    await expect(page.getByText('Mot de passe mis à jour')).toBeVisible();
    await page.click('text=Se connecter');

    // Login with new password
    await page.fill('input[name="email"]', resetEmail);
    await page.fill('input[name="password"]', newPassword);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/dashboard/);

    // Concurrent/re-use reset check (try to use the reset link again)
    await page.goto(resetLink);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(
      page.getByText('Ce lien de réinitialisation est invalide ou a expiré.'),
    ).toBeVisible();
  });
});
