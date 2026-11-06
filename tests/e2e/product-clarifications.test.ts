import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { PDFDocument } from 'pdf-lib';
import { writeFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';

test('personalized card PDF, material feasibility, profile and protected audio without an invitation', async ({
  page,
  browser,
}, info) => {
  await page.goto('/inscription');
  await page.getByLabel('Prénom', { exact: true }).fill('Samira');
  await page.getByLabel('Nom', { exact: true }).fill('Martin');
  await page
    .locator('[name=email]')
    .fill(`product.${randomUUID()}@example.invalid`);
  await page.locator('[name=password]').fill('ProductPassword123!Long');
  await page
    .locator('[name=passwordConfirmation]')
    .fill('ProductPassword123!Long');
  await page.locator('button[type=submit]').click();
  await expect(page).toHaveURL('/dashboard');
  await page.goto('/events/new');
  await page.locator('[name=name]').fill('Les 30 ans de Samira');
  await page.locator('[name=startAt]').fill('2027-07-04T18:00');
  await page.getByRole('button', { name: 'Créer l’événement' }).click();
  await expect(page).toHaveURL('/dashboard');
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
  const pdfResponse = await page.request.get(
    `${eventUrl}/cartes/pdf?revision=1`,
  );
  expect(pdfResponse.status()).toBe(200);
  expect(pdfResponse.headers()['cache-control']).toContain('no-store');
  expect(pdfResponse.headers()['content-type']).toBe('application/pdf');
  const bytes = await pdfResponse.body();
  expect((await PDFDocument.load(bytes)).getPageCount()).toBe(2);
  await writeFile(info.outputPath('carte-remerciement.pdf'), bytes);
  const context = await browser.newContext();
  const anonymous = await context.newPage();
  expect(
    (await anonymous.request.get(`${eventUrl}/cartes/pdf?revision=1`)).status(),
  ).toBe(404);
  expect(
    (await page.request.get(`${eventUrl}/cartes/pdf?revision=999`)).status(),
  ).toBe(404);
  await page.getByLabel('Matériau souhaité').fill('Plexiglas transparent');
  await page.getByLabel('Quantité souhaitée').fill('12');
  await page.getByRole('button', { name: 'Demander la faisabilité' }).click();
  await expect(page.getByText(/Demande enregistrée/)).toBeVisible();
  await page.reload();
  await expect(
    page.getByText(/12 exemplaires · Plexiglas transparent/),
  ).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({
    path: info.outputPath('cartes-desktop.png'),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: info.outputPath('cartes-mobile.png'),
    fullPage: true,
  });
  await page.goto('/profil');
  await page.getByLabel('Prénom', { exact: true }).fill('Sami');
  await page.getByRole('button', { name: 'Enregistrer mon profil' }).click();
  await expect(page.getByRole('status')).toContainText('Profil enregistré');
  await page.reload();
  await expect(page.getByLabel('Prénom', { exact: true })).toHaveValue('Sami');
  await expect(page.getByText('1,49', { exact: false })).toBeVisible();
  await page.screenshot({
    path: info.outputPath('profil-mobile.png'),
    fullPage: true,
  });
  await page.goto(`${eventUrl}/souvenirs`);
  const audio = page
    .locator('section')
    .filter({
      has: page.getByRole('heading', { name: 'Livre d’or audio', exact: true }),
    })
    .first();
  await expect(audio.getByLabel('Accepter les dépôts')).toBeVisible();
  await expect(audio.getByLabel('Ouvrir la galerie aux invités')).toHaveCount(
    0,
  );
  await expect(audio.getByLabel('Autoriser les téléchargements')).toHaveCount(
    0,
  );
  await context.close();
});

test('Studio publishes customized blocks, household RSVP and imported invitation music', async ({
  page,
  browser,
}, info) => {
  await page.goto('/inscription');
  await page.getByLabel('Prénom', { exact: true }).fill('Léa');
  await page.getByLabel('Nom', { exact: true }).fill('Dubois');
  await page
    .locator('[name=email]')
    .fill(`studio.${randomUUID()}@example.invalid`);
  await page.locator('[name=password]').fill('ProductPassword123!Long');
  await page
    .locator('[name=passwordConfirmation]')
    .fill('ProductPassword123!Long');
  await page.locator('button[type=submit]').click();
  await expect(page).toHaveURL('/dashboard');
  await page.goto('/events/new');
  await page.locator('[name=name]').fill('Henné de Léa');
  await page.locator('[name=startAt]').fill('2027-07-04T18:00');
  await page.getByRole('button', { name: 'Créer l’événement' }).click();
  await expect(page).toHaveURL('/dashboard');
  await page.getByRole('link', { name: /Gérer/ }).click();
  await expect(page).toHaveURL(/\/events\/[0-9a-f-]+$/);
  const eventUrl = page.url();
  await page.getByRole('button', { name: 'Activer la démonstration' }).click();
  await expect(page.getByRole('status')).toContainText('Démonstration activée');
  await page.goto(`${eventUrl}/studio`);
  await page.getByLabel('Ajouter une section').selectOption('calendar');
  await expect(
    page.getByText('Ajouter à mon calendrier', { exact: true }),
  ).toBeVisible();
  await page.getByLabel('Ajouter une section').selectOption('countdown');
  await expect(
    page.getByLabel('Compte à rebours', { exact: true }),
  ).toBeVisible();
  await page.getByLabel('Ajouter une section').selectOption('dress_code');
  await page.getByLabel('Texte', { exact: true }).fill('Une touche de vert');
  await page.getByLabel('Taille du titre', { exact: true }).focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowRight');
  await expect(
    page
      .getByRole('region', { name: 'Aperçu de l’invitation' })
      .getByRole('heading', { name: 'Dress code', exact: true }),
  ).toHaveCSS('font-size', '15px');
  await page
    .getByText('Cadre, typographie et transparence', { exact: true })
    .click();
  await page.getByLabel('Gras', { exact: true }).check();
  await expect(
    page
      .getByRole('region', { name: 'Aperçu de l’invitation' })
      .getByRole('heading', { name: 'Dress code', exact: true }),
  ).toHaveCSS('font-weight', '700');
  await page.getByLabel('Ajouter une section').selectOption('location');
  await page.getByLabel('Titre', { exact: true }).fill('Le jardin');
  await page.getByLabel('Texte', { exact: true }).fill('Paris');
  await expect(
    page.getByRole('link', { name: 'Itinéraire Google Maps', exact: true }),
  ).toHaveCount(2);
  await page.getByLabel('Ajouter une section').selectOption('location');
  await page.getByLabel('Titre', { exact: true }).fill('La soirée');
  await page.getByLabel('Texte', { exact: true }).fill('Lyon');
  await page
    .getByRole('combobox', { name: 'Application d’itinéraire', exact: true })
    .selectOption('waze');
  await expect(page.getByRole('link', { name: /^Itinéraire/ })).toHaveCount(0);
  await expect(
    page.getByRole('link', { name: 'La soirée', exact: true }),
  ).toHaveAttribute('href', 'https://waze.com/ul?q=Lyon&navigate=yes');
  await page.getByRole('button', { name: 'Ajouter une question RSVP' }).click();
  await page.getByLabel('Libellé du champ 1').fill('Votre foyer');
  await page.getByLabel('Relier cette réponse au foyer de l’invité').check();
  await page.getByText('Musique de l’invitation', { exact: true }).click();
  const wav = Buffer.alloc(44 + 16000);
  wav.write('RIFF');
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(8000, 24);
  wav.writeUInt32LE(16000, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write('data', 36);
  wav.writeUInt32LE(16000, 40);
  await page.getByLabel('Importer une musique', { exact: true }).setInputFiles({
    name: 'invitation.wav',
    mimeType: 'audio/wav',
    buffer: wav,
  });
  await expect(
    page.getByText(
      'Musique importée. Sélectionnez-la dans la liste pour l’utiliser.',
    ),
  ).toBeVisible();
  await page
    .getByRole('combobox', { name: 'Musique importée', exact: true })
    .selectOption({ label: 'invitation.wav' });
  await page.getByRole('button', { name: 'Publier', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Copier', exact: true }),
  ).toBeVisible();
  const link = (await page.locator('a[href*="/i/"]').getAttribute('href'))!;
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const guest = await context.newPage();
  await guest.goto(link);
  await guest
    .getByRole('button', { name: 'Ouvrir l’invitation', exact: true })
    .click();
  await expect(guest.getByText('Une touche de vert')).toBeVisible();
  await expect(guest.locator('audio')).toBeVisible();
  const audioUrl = (await guest.locator('audio').getAttribute('src'))!;
  expect((await guest.request.get(audioUrl)).status()).toBe(200);
  await guest.locator('[name=guest_name]').fill('Nora');
  await guest.locator('[name=guest_email]').fill('nora@example.invalid');
  await guest.locator('[name=presence][value=no]').check();
  await guest.getByLabel('Votre foyer', { exact: true }).fill('Famille Nora');
  await guest.locator('[name=consent]').check();
  await guest.getByRole('button', { name: /Envoyer/ }).click();
  await expect(guest.getByRole('status')).toContainText(/enregistr|merci/i);
  await guest.screenshot({
    path: info.outputPath('invitation-mobile.png'),
    fullPage: true,
  });
  await page.goto(`${eventUrl}/invites`);
  await expect(
    page.getByRole('cell', { name: 'Famille Nora', exact: true }).first(),
  ).toBeVisible();
  await page.screenshot({
    path: info.outputPath('reponses-foyer.png'),
    fullPage: true,
  });
  await context.close();
});
