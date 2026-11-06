import { test, expect, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import AxeBuilder from '@axe-core/playwright';

async function register(page: Page, email: string) {
  await page.goto('/inscription');
  await page.getByLabel('Prénom', { exact: true }).fill('Nora');
  await page.getByLabel('Nom', { exact: true }).fill('Benali');
  await page.locator('[name=email]').fill(email);
  await page.locator('[name=password]').fill('OperatorPassword123!Long');
  await page
    .locator('[name=passwordConfirmation]')
    .fill('OperatorPassword123!Long');
  await page.locator('button[type=submit]').click();
  await expect(page).toHaveURL('/dashboard');
}

test('operator processes a print request that the owner then sees, others get 404', async ({
  page,
  browser,
}) => {
  await register(page, `owner.${randomUUID()}@example.invalid`);
  expect((await page.request.get('/admin')).status()).toBe(404);
  await page.goto('/events/new');
  await page.locator('[name=name]').fill('Mariage de Nora');
  await page.locator('[name=startAt]').fill('2027-09-04T16:00');
  await page.getByRole('button', { name: 'Créer l’événement' }).click();
  await page.getByRole('link', { name: /Gérer/ }).click();
  await expect(page).toHaveURL(/\/events\/[0-9a-f-]+$/);
  const eventUrl = page.url();
  await page.getByRole('button', { name: 'Activer la démonstration' }).click();
  await expect(page.getByRole('status')).toContainText('Démonstration activée');
  await page.goto(`${eventUrl}/cartes`);
  await page.getByRole('button', { name: 'Enregistrer ma carte' }).click();
  await expect(page.getByRole('status').first()).toContainText(
    'Carte enregistrée',
  );
  await page.getByLabel('Matériau souhaité').fill('Papier coton');
  await page.getByLabel('Quantité souhaitée').fill('80');
  await page.getByRole('button', { name: 'Demander la faisabilité' }).click();
  await expect(page.getByText(/Demande enregistrée/)).toBeVisible();

  const context = await browser.newContext();
  const ops = await context.newPage();
  await register(ops, 'operator@example.test');
  await ops.goto('/admin');
  await expect(
    ops.getByRole('heading', { name: 'Back-office', level: 1 }),
  ).toBeVisible();
  const card = ops
    .getByRole('article')
    .filter({ hasText: 'Mariage de Nora · 80 × Papier coton' });
  await expect(card).toContainText('Demande reçue');
  await card.getByLabel('Nouvelle étape').selectOption('quote_sent');
  await card.getByLabel('Note pour le client').fill('Devis de 96 € envoyé');
  await card.getByRole('button', { name: 'Enregistrer' }).click();
  await expect(card.getByRole('status')).toHaveText('Étape enregistrée.');
  await expect(card).toContainText('Devis envoyé');
  expect((await new AxeBuilder({ page: ops }).analyze()).violations).toEqual(
    [],
  );
  await context.close();

  await page.reload();
  await expect(
    page.getByText(
      /80 exemplaires · Papier coton .*Devis envoyé · Devis de 96 € envoyé/,
    ),
  ).toBeVisible();
});
