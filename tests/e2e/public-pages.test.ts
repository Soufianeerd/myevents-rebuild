import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = [
  ['/tarifs', 'Un paiement unique par événement'],
  ['/mentions-legales', 'Mentions légales'],
  ['/cgv', 'Conditions générales de vente'],
  ['/confidentialite', 'Politique de confidentialité'],
] as const;

test('pricing lists every purchasable offer with its price', async ({
  page,
}) => {
  await page.goto('/tarifs');
  for (const [name, price] of [
    ['Invitation digitale', '14,99'],
    ['Photos et vidéos', '19,99'],
    ['Invitation + Audio', '24,99'],
    ['Audio + Photos et vidéos', '27,99'],
    ['Expérience complète', '39,99'],
  ]) {
    const card = page.getByRole('listitem').filter({
      has: page.getByRole('heading', { name, exact: true }),
    });
    await expect(card).toContainText(price);
  }
  await expect(page.getByText('1,49 €', { exact: false })).toBeVisible();
  await page
    .getByRole('link', { name: 'conditions générales de vente' })
    .click();
  await expect(page).toHaveURL(/\/cgv$/);
});

test('home footer links to the legal pages', async ({ page }) => {
  await page.goto('/');
  const footer = page.getByRole('navigation', { name: 'Informations' });
  for (const name of [
    'Tarifs',
    'Mentions légales',
    'Conditions de vente',
    'Confidentialité',
  ])
    await expect(footer.getByRole('link', { name })).toBeVisible();
});

test('responses carry the security headers', async ({ request }) => {
  const response = await request.get('/tarifs');
  const headers = response.headers();
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['content-security-policy']).toContain(
    "frame-ancestors 'none'",
  );
  expect(headers['content-security-policy']).toContain("object-src 'none'");
});

for (const [path, title] of pages) {
  for (const width of [390, 1440]) {
    test(`${path} is accessible without overflow at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      expect(overflow).toBe(false);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
}
