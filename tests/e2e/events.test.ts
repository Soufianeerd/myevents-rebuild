import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { randomUUID } from 'node:crypto';

async function register(page: Page) {
  await page.goto('/inscription');
  await page.getByLabel('Prénom', { exact: true }).fill('Event');
  await page.getByLabel('Nom', { exact: true }).fill('Tester');
  await page.locator('[name=email]').fill(`event.${randomUUID()}@example.com`);
  await page.locator('[name=password]').fill('EventPassword123!Long');
  await page
    .locator('[name=passwordConfirmation]')
    .fill('EventPassword123!Long');
  await page.locator('button[type=submit]').click();
  await expect(page).toHaveURL('/dashboard');
}

test('event creation, detail, edition, tenant isolation and deletion in production', async ({
  page,
  browser,
}, testInfo) => {
  await register(page);
  await page.goto('/events/new');
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page
    .getByLabel('Nom de l’événement', { exact: false })
    .or(page.locator('[name=name]'))
    .first()
    .fill('Événement de validation');
  await page.locator('[name=startAt]').fill('2026-12-10T15:00');
  await page.locator('[name=endAt]').fill('2026-12-10T18:00');
  await page.locator('[name=primaryLocation]').fill('Paris');
  await page.screenshot({
    path: testInfo.outputPath('event-create-mobile.png'),
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Créer l’événement' }).click();
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByRole('main')).toBeVisible();
  expect(
    await page
      .getByRole('main')
      .evaluate((main) => main.scrollWidth <= main.clientWidth),
  ).toBe(true);
  await page.getByRole('link', { name: /Gérer/ }).click();
  await expect(page).toHaveURL(/\/events\/[0-9a-f-]{36}$/);
  await expect(
    page.getByRole('heading', { name: 'Événement de validation' }),
  ).toBeVisible();
  await expect(
    page.getByText('10/12/2026 à 15:00', { exact: false }),
  ).toBeVisible();
  const url = page.url();
  await page.getByRole('link', { name: 'Modifier', exact: true }).click();
  await page.locator('[name=name]').fill('Événement modifié');
  await page.locator('[name=primaryLocation]').fill('Casablanca');
  await page.locator('[name=timezone]').selectOption('Africa/Casablanca');
  await page
    .getByRole('button', { name: 'Enregistrer les modifications' })
    .click();
  await expect(page).toHaveURL(url);
  await expect(
    page.getByRole('heading', { name: 'Événement modifié' }),
  ).toBeVisible();
  await expect(page.getByText('Casablanca', { exact: true })).toBeVisible();
  expect(
    await page
      .getByRole('main')
      .evaluate((main) => main.scrollWidth <= main.clientWidth),
  ).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  const size = await page.evaluate(() => ({
    width: innerWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(size.content).toBeLessThanOrEqual(size.width);
  await page.screenshot({
    path: testInfo.outputPath('event-detail-mobile.png'),
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: testInfo.outputPath('event-detail-desktop.png'),
    fullPage: true,
  });

  const ownerCookies = await page.context().cookies();
  const other = await browser.newContext({
    baseURL: testInfo.project.use.baseURL,
  });
  try {
    const stranger = await other.newPage();
    await register(stranger);
    await expect(stranger.getByText('Événement modifié')).toHaveCount(0);
    expect((await stranger.goto(url))?.status()).toBe(404);
    expect((await stranger.goto(`${url}/edit`))?.status()).toBe(404);
    // A previously opened owner form must re-authorize when its session changes.
    await page.goto(`${url}/edit`);
    await page.context().clearCookies();
    await page.context().addCookies(await other.cookies());
    await page.locator('[name=name]').fill('Modification interdite');
    await page
      .getByRole('button', { name: 'Enregistrer les modifications' })
      .click();
    await expect(
      page.getByRole('alert').filter({ hasText: 'Événement introuvable.' }),
    ).toBeVisible();
  } finally {
    await other.close();
  }

  await page.context().clearCookies();
  await page.context().addCookies(ownerCookies);
  await page.goto(url);
  await expect(
    page.getByRole('heading', { name: 'Événement modifié' }),
  ).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Supprimer' }).click();
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByText('Événement modifié')).toHaveCount(0);
  expect((await page.goto(url))?.status()).toBe(404);
});

test('mailbox never exposes reset messages in production', async ({
  request,
}) => {
  expect((await request.get('/dev/mailbox')).status()).toBe(404);
});

test('an anonymous visitor cannot open the event creation page', async ({
  page,
}) => {
  await page.goto('/events/new');
  await expect(page).toHaveURL(/\/connexion/);
});
