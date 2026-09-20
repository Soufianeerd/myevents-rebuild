import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home explains the preparation version and opens the working account flow', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/MyEvents/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Célébrez chaquehistoire qui compte.',
  );
  await expect(
    page.getByText('Version de préparation', { exact: true }),
  ).toBeVisible();
  await page
    .getByText('Puis-je déjà acheter une offre ?', { exact: true })
    .click();
  await expect(
    page.getByText('Les offres et le paiement ne sont pas encore ouverts.', {
      exact: false,
    }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Créer mon événement' }).first().click();
  await expect(page).toHaveURL(/\/connexion/);
  await expect(
    page.getByRole('heading', { name: 'Connexion', exact: true }),
  ).toBeVisible();
});

test('home is accessible without horizontal overflow on mobile and desktop', async ({
  page,
}) => {
  for (const width of [360, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const audit = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();
    expect(audit.violations).toEqual([]);
  }
});

test('home navigation and FAQ work with the keyboard', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Aller au contenu' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#contenu$/);
  const question = page.locator('summary').first();
  await question.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('details').first()).toHaveAttribute('open', '');
});
