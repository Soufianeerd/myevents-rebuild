import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Neon confirmation: responsive form, accessible fields and anonymous route protection', async ({
  page,
}) => {
  await page.goto('/confirmer-adresse');
  await expect(
    page.getByRole('heading', { name: 'Confirmer mon adresse' }),
  ).toBeVisible();
  await expect(page.getByLabel('Code de confirmation')).toHaveAttribute(
    'autocomplete',
    'one-time-code',
  );
  await expect(page.getByLabel('Adresse e-mail')).toHaveAttribute(
    'type',
    'email',
  );
  // Do not submit verification, signup, resend or recovery emails in this test.
  for (const [name, width, height] of [
    ['desktop', 1280, 900],
    ['mobile', 390, 844],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.waitForLoadState('networkidle');
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const audit = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();
    expect(
      audit.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
      ),
    ).toEqual([]);
    await page.screenshot({
      path: `docs/audit/evidence/neon/confirmation-${name}.png`,
      fullPage: true,
    });
  }
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/connexion/);
  await expect(
    page.getByRole('heading', { name: 'Connexion', exact: true }),
  ).toBeVisible();
});
