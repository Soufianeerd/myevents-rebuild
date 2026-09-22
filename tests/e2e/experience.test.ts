import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
test('business preview: Studio → published invitation → guest RSVP → owner responses and purchased QR', async ({
  page,
  browser,
}, info) => {
  await page.goto('/inscription');
  await page.getByLabel('Prénom', { exact: true }).fill('Camille');
  await page.getByLabel('Nom', { exact: true }).fill('Test');
  await page
    .locator('[name=email]')
    .fill(`journey.${randomUUID()}@example.invalid`);
  await page.locator('[name=password]').fill('JourneyPassword123!Long');
  await page
    .locator('[name=passwordConfirmation]')
    .fill('JourneyPassword123!Long');
  await page.locator('button[type=submit]').click();
  await expect(page).toHaveURL('/dashboard');
  await page.goto('/events/new');
  await page.locator('[name=name]').fill('Camille & Alex');
  await page.locator('[name=startAt]').fill('2027-06-12T15:00');
  await page.getByRole('button', { name: 'Créer l’événement' }).click();
  await expect(page).toHaveURL('/dashboard');
  await page.getByRole('link', { name: /Gérer/ }).click();
  await expect(page).toHaveURL(/\/events\/[0-9a-f-]{36}$/);
  const eventUrl = page.url();
  await page.getByRole('button', { name: 'Activer la démonstration' }).click();
  await expect(page.getByRole('status')).toContainText('Démonstration activée');
  await page.goto(`${eventUrl}/studio`);
  await page.screenshot({
    path: info.outputPath('studio-desktop.png'),
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Publier', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Copier', exact: true }),
  ).toBeVisible();
  const link = (await page.locator('a[href*="/i/"]').getAttribute('href'))!;
  const context = await browser.newContext();
  const guest = await context.newPage();
  await guest.goto(link);
  const opening = guest.getByRole('button', { name: /Passer|ouvrir/i });
  if (await opening.count()) await opening.first().click();
  await guest.locator('[name=guest_name]').fill('Invitée test');
  await guest.locator('[name=guest_email]').fill('invitee@example.invalid');
  await guest.locator('[name=presence][value=yes]').check();
  await guest.locator('[name=consent]').check();
  await guest.getByRole('button', { name: /Envoyer/ }).click();
  await expect(guest.getByRole('status')).toContainText(/enregistr|merci/i);
  await page.goto(`${eventUrl}/invites`);
  await expect(page.getByText('Invitée test')).toBeVisible();
  await page.goto(`${eventUrl}/souvenirs`);
  await page
    .getByRole('button', { name: 'Enregistrer les réglages' })
    .first()
    .click();
  await expect(page.getByAltText('QR code photos et vidéos')).toBeVisible();
  const qr = await page.request.get(
    `${eventUrl}/souvenirs/qr?kind=photo_video`,
  );
  expect(qr.status()).toBe(200);
  expect(qr.headers()['content-type']).toBe('image/png');
  const galleryLink = (await page
    .getByRole('link', { name: 'Ouvrir l’espace invité' })
    .first()
    .getAttribute('href'))!;
  await guest.goto(galleryLink);
  await guest
    .getByLabel('Choisir un fichier')
    .setInputFiles('public/images/editorial/jardin.jpg');
  await guest.getByRole('checkbox').check();
  await guest.getByRole('button', { name: 'Envoyer mon souvenir' }).click();
  await expect(guest.getByRole('status')).toContainText('bien été enregistré');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'jardin.jpg' })).toBeVisible();
  await page.screenshot({
    path: info.outputPath('souvenirs-desktop.png'),
    fullPage: true,
  });
  await page.goto(`${eventUrl}/cartes`);
  await page
    .getByRole('textbox', { name: 'Texte', exact: true })
    .fill('Merci infiniment');
  await page.getByRole('button', { name: 'Verso', exact: true }).click();
  await page
    .getByRole('button', { name: 'QR Photo / Vidéo', exact: true })
    .click();
  await page.getByRole('button', { name: 'Enregistrer ma carte' }).click();
  await expect(
    page.getByText('Carte enregistrée.', { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('textbox', { name: 'Texte', exact: true }),
  ).toHaveValue('Merci infiniment');
  await page.getByRole('button', { name: 'Verso', exact: true }).click();
  await expect(page.getByAltText('QR photo_video')).toBeVisible();
  await page.screenshot({
    path: info.outputPath('cartes-desktop.png'),
    fullPage: true,
  });
  await context.close();
});
