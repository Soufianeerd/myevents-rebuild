import { test, expect, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import AxeBuilder from '@axe-core/playwright';
import { readZip } from '../helpers/readZip';

async function signup(page: Page) {
  await page.goto('/inscription');
  await page.getByLabel('Prénom', { exact: true }).fill('Archive');
  await page.getByLabel('Nom', { exact: true }).fill('Test');
  await page
    .locator('[name=email]')
    .fill(`export.${randomUUID()}@example.invalid`);
  await page.locator('[name=password]').fill('ExportPassword123!Long');
  await page
    .locator('[name=passwordConfirmation]')
    .fill('ExportPassword123!Long');
  await page.locator('button[type=submit]').click();
  await expect(page).toHaveURL('/dashboard');
}
test('event archive is useful with no media, stays private between accounts and validates selection', async ({
  page,
  browser,
}, info) => {
  await signup(page);
  await page.goto('/events/new');
  await page.locator('[name=name]').fill('Anniversaire');
  await page.locator('[name=startAt]').fill('2027-06-12T15:00');
  await page.getByRole('button', { name: 'Créer l’événement' }).click();
  await expect(page).toHaveURL('/dashboard');
  await page.getByRole('link', { name: /Gérer/ }).click();
  await expect(page).toHaveURL(/\/events\/[0-9a-f-]{36}$/);
  const eventUrl = page.url();
  await page.goto(`${eventUrl}/souvenirs`);
  const response = await page.request.get(`${eventUrl}/souvenirs/export`);
  expect(response.status()).toBe(200);
  const archive = await readZip(await response.body());
  expect(
    JSON.parse(archive.get('Anniversaire/exports/evenement.json')!.toString())
      .name,
  ).toBe('Anniversaire');
  expect(
    JSON.parse(archive.get('Anniversaire/exports/manifest.json')!.toString())
      .files,
  ).toEqual([]);
  expect(archive.has('Anniversaire/rsvp/invites.csv')).toBe(true);
  expect(archive.has('Anniversaire/creation/carte-remerciement.json')).toBe(
    false,
  );
  for (const query of [
    'scope=selection',
    `scope=selection&id=${randomUUID()}`,
    'scope=selection&id=../../secret',
    'scope=bad',
  ])
    expect(
      (
        await page.request.get(`${eventUrl}/souvenirs/export?${query}`)
      ).status(),
    ).toBe(404);
  expect(
    (
      await new AxeBuilder({ page })
        .include('section[aria-labelledby="export-title"]')
        .analyze()
    ).violations,
  ).toEqual([]);
  await page
    .getByRole('heading', { name: 'Emportez vos souvenirs' })
    .scrollIntoViewIfNeeded();
  await page.screenshot({
    path: info.outputPath('export-desktop.png'),
    fullPage: true,
  });
  await page
    .locator('section[aria-labelledby="export-title"]')
    .screenshot({ path: info.outputPath('export-card-desktop.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: info.outputPath('export-mobile.png'),
    fullPage: true,
  });
  await page
    .locator('section[aria-labelledby="export-title"]')
    .screenshot({ path: info.outputPath('export-card-mobile.png') });
  const context = await browser.newContext();
  const other = await context.newPage();
  await signup(other);
  const foreign = await other.request.get(`${eventUrl}/souvenirs/export`);
  expect(foreign.status()).toBe(404);
  expect(await foreign.text()).not.toContain('Anniversaire');
  await context.close();
});
