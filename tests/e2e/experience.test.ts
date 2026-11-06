import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import { readZip } from '../helpers/readZip';
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
  await page.getByRole('button', { name: 'Photo', exact: true }).click();
  await page
    .getByLabel('Importer ma photo', { exact: true })
    .setInputFiles('public/images/editorial/reception.jpg');
  await expect(
    page.getByText(
      'Photo importée. Elle sera visible après publication de l’invitation.',
      { exact: true },
    ),
  ).toBeVisible();
  await page.screenshot({
    path: info.outputPath('studio-photo-personnelle.png'),
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
  const publishedPhoto = guest.getByAltText('Photographie de l’invitation');
  await expect(publishedPhoto).toBeVisible();
  const imageUrl = (await publishedPhoto.getAttribute('src'))!;
  const imageResponse = await guest.request.get(imageUrl);
  expect(imageResponse.status()).toBe(200);
  expect(imageResponse.headers()['content-type']).toContain('image/jpeg');
  await guest.locator('[name=guest_name]').fill('Invitée test');
  await guest.locator('[name=guest_email]').fill('invitee@example.invalid');
  await guest.locator('[name=presence][value=yes]').check();
  await guest.locator('[name=consent]').check();
  await guest.getByRole('button', { name: /Envoyer/ }).click();
  await expect(guest.getByRole('status')).toContainText(/enregistr|merci/i);
  await page.goto(`${eventUrl}/invites`);
  await expect(
    page.getByRole('cell', { name: 'Invitée test', exact: true }),
  ).toBeVisible();
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
  const downloadUrl = (await page
    .getByRole('link', { name: 'Télécharger jardin.jpg', exact: true })
    .getAttribute('href'))!;
  const mediaId = downloadUrl.split('/').at(-1)!.split('?')[0];
  const privateGuestDownload = await guest.request.get(
    `${galleryLink}/fichiers/${mediaId}?download=1`,
  );
  expect(privateGuestDownload.status()).toBe(404);
  const anonymousOwnerDownload = await guest.request.get(downloadUrl);
  expect(anonymousOwnerDownload.status()).toBe(404);
  const downloaded = await page.request.get(downloadUrl);
  expect(downloaded.status()).toBe(200);
  expect(downloaded.headers()['content-disposition']).toContain('attachment');
  const zipResponse = await page.request.get(`${eventUrl}/souvenirs/export`);
  expect(zipResponse.status()).toBe(200);
  expect(zipResponse.headers()['content-type']).toBe('application/zip');
  expect(zipResponse.headers()['cache-control']).toContain('no-store');
  const archive = await readZip(await zipResponse.body());
  const photoPath = [...archive.keys()].find((path) =>
    path.includes('/photos/'),
  )!;
  expect(archive.get(photoPath)).toEqual(
    await readFile('public/images/editorial/jardin.jpg'),
  );
  expect(
    [...archive.keys()].some((path) => path.includes('/creation/fichiers/')),
  ).toBe(true);
  expect(archive.get('Camille-Alex/rsvp/reponses.csv')!.toString()).toContain(
    'Invitée test',
  );
  expect(archive.has('Camille-Alex/invitation/invitation.json')).toBe(true);
  const manifest = archive
    .get('Camille-Alex/exports/manifest.json')!
    .toString();
  expect(JSON.parse(manifest).files).toHaveLength(2);
  expect(manifest).not.toMatch(/objectKey|tokenHash|uploadHash/);
  expect(
    (await guest.request.get(`${eventUrl}/souvenirs/export`)).status(),
  ).toBe(404);
  await page
    .getByRole('button', { name: 'Agrandir jardin.jpg', exact: true })
    .click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page
    .getByRole('button', { name: 'Fermer l’aperçu', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Agrandir jardin.jpg', exact: true }),
  ).toBeFocused();
  await page
    .getByRole('checkbox', { name: 'Sélectionner jardin.jpg', exact: true })
    .check();
  const zipDownload = page.waitForEvent('download');
  await page
    .getByRole('link', { name: 'Télécharger la sélection (.zip)', exact: true })
    .click();
  const selectedDownload = await zipDownload;
  const selectedArchive = await readZip(
    await readFile((await selectedDownload.path())!),
  );
  expect(selectedDownload.suggestedFilename()).toBe('Camille-Alex.zip');
  expect(
    [...selectedArchive.keys()].filter((path) => path.includes('/photos/')),
  ).toHaveLength(1);
  expect(selectedArchive.has('Camille-Alex/rsvp/reponses.json')).toBe(false);
  await page
    .getByRole('button', { name: 'Mettre en favoris', exact: true })
    .click();
  await expect(
    page.getByText('1 fichier modifié.', { exact: true }),
  ).toBeVisible();
  await page
    .getByRole('checkbox', { name: 'Mes favoris uniquement', exact: true })
    .check();
  await expect(
    page.getByRole('heading', { name: 'jardin.jpg', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('checkbox', { name: 'Mes favoris uniquement', exact: true })
    .uncheck();
  await page
    .getByRole('combobox', { name: 'Type de média', exact: true })
    .selectOption('studio');
  await expect(
    page.getByRole('heading', { name: 'reception.jpg', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('combobox', { name: 'Type de média', exact: true })
    .selectOption('souvenirs');
  await page
    .getByRole('combobox', { name: 'Type de média', exact: true })
    .scrollIntoViewIfNeeded();
  await page.screenshot({
    path: info.outputPath('souvenirs-desktop.png'),
    fullPage: true,
  });
  await page
    .getByRole('region', { name: 'Galerie de vos médias' })
    .locator('article')
    .first()
    .screenshot({ path: info.outputPath('souvenir-carte-desktop.png') });
  // A filter change must never leave invisible files selected for deletion.
  await page.getByLabel('Sélectionner jardin.jpg', { exact: true }).check();
  await page
    .getByRole('combobox', { name: 'Type de média', exact: true })
    .selectOption('studio');
  await expect(
    page.getByRole('button', { name: 'Supprimer la sélection', exact: true }),
  ).toHaveCount(0);
  await page.getByLabel('Sélectionner reception.jpg', { exact: true }).check();
  page.once('dialog', (dialog) => dialog.accept());
  await page
    .getByRole('button', { name: 'Supprimer la sélection', exact: true })
    .click();
  await expect(page.getByText(/1 non modifié/)).toBeVisible();
  expect((await guest.request.get(imageUrl)).status()).toBe(200);
  await page
    .getByRole('combobox', { name: 'Type de média', exact: true })
    .selectOption('souvenirs');

  const photoSpace = page.locator('section').filter({
    has: page.getByRole('heading', { name: 'Photos & vidéos', exact: true }),
  });
  await photoSpace
    .getByLabel('Ouvrir la galerie aux invités', { exact: true })
    .check();
  await photoSpace
    .getByLabel('Ouverture de la galerie', { exact: true })
    .fill('2020-01-01T12:00');
  await photoSpace
    .getByRole('button', { name: 'Enregistrer les réglages' })
    .click();
  const guestFile = `${galleryLink}/fichiers/${mediaId}`;
  await expect
    .poll(async () => (await guest.request.get(guestFile)).status())
    .toBe(200);
  const blockedDownload = await guest.request.get(`${guestFile}?download=1`);
  expect(blockedDownload.status()).toBe(404);
  expect(blockedDownload.headers()['cache-control']).toContain('no-store');
  await photoSpace
    .getByLabel('Autoriser les téléchargements', { exact: true })
    .check();
  await photoSpace
    .getByRole('button', { name: 'Enregistrer les réglages' })
    .click();
  await expect
    .poll(async () =>
      (await guest.request.get(`${guestFile}?download=1`)).status(),
    )
    .toBe(200);
  await page.getByLabel('Sélectionner jardin.jpg', { exact: true }).check();
  await page
    .getByRole('button', { name: 'Masquer la sélection', exact: true })
    .click();
  await expect(
    page.getByText('Masqué aux invités', { exact: true }),
  ).toBeVisible();
  expect((await guest.request.get(guestFile)).status()).toBe(404);
  expect((await page.request.get(downloadUrl)).status()).toBe(200);
  await page.getByLabel('Sélectionner jardin.jpg', { exact: true }).check();
  await page
    .getByRole('button', {
      name: 'Montrer la sélection aux invités',
      exact: true,
    })
    .click();
  await expect
    .poll(async () => (await guest.request.get(guestFile)).status())
    .toBe(200);

  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole('combobox', { name: 'Type de média', exact: true })
    .scrollIntoViewIfNeeded();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: info.outputPath('souvenirs-mobile.png'),
    fullPage: true,
  });
  expect(
    (
      await new AxeBuilder({ page })
        .include('section[aria-label="Galerie de vos médias"]')
        .analyze()
    ).violations,
  ).toEqual([]);
  await page
    .getByRole('region', { name: 'Galerie de vos médias' })
    .locator('article')
    .first()
    .screenshot({ path: info.outputPath('souvenir-carte-mobile.png') });
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.getByLabel('Sélectionner jardin.jpg', { exact: true }).check();
  page.once('dialog', (dialog) => dialog.accept());
  await page
    .getByRole('button', { name: 'Supprimer la sélection', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'jardin.jpg', exact: true }),
  ).toHaveCount(0);
  expect((await guest.request.get(guestFile)).status()).toBe(404);
  expect((await page.request.get(downloadUrl)).status()).toBe(404);
  expect(
    (
      await page.request.get(
        `${eventUrl}/souvenirs/export?scope=selection&id=${mediaId}`,
      )
    ).status(),
  ).toBe(404);
  expect((await guest.request.get(imageUrl)).status()).toBe(200);
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
  await page.goto(`${eventUrl}/organisation`);
  await page.getByRole('button', { name: 'Ajouter une tâche' }).click();
  await page.getByRole('textbox', { name: /^Titre/ }).fill('Réserver le lieu');
  await page.getByLabel('Responsable').fill('Camille');
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Réserver le lieu' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Enregistrer', exact: true }),
  ).toHaveCount(0);
  await page.getByRole('checkbox', { name: 'Tâche terminée' }).check();
  await expect(
    page.getByRole('checkbox', { name: 'Tâche terminée' }),
  ).toBeEnabled();
  await expect(
    page.getByText('1/1 tâches terminées', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Budget (0)', exact: true }).click();
  await page.getByRole('button', { name: 'Ajouter une dépense' }).click();
  await page
    .getByRole('textbox', { name: /^Dépense/ })
    .fill('Location du lieu');
  await page.getByLabel('Budget prévu (€)', { exact: true }).fill('1000');
  await page.getByLabel('Coût réel (€)', { exact: true }).fill('1100');
  await page.getByLabel('Montant payé (€)', { exact: true }).fill('300');
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Location du lieu' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Enregistrer', exact: true }),
  ).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByText('1/1 tâches terminées', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Budget (1)', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Location du lieu' }),
  ).toBeVisible();
  await page.screenshot({
    path: info.outputPath('organisation-desktop.png'),
    fullPage: true,
  });
  await page.goto(`${eventUrl}/invites`);
  await page
    .getByRole('button', { name: 'Ajouter un invité', exact: true })
    .click();
  const card = page
    .locator('form')
    .filter({ has: page.getByRole('heading', { name: 'Fiche invité' }) });
  await card.getByLabel('Nom', { exact: true }).fill('Alice Martin');
  await card
    .getByLabel('E-mail', { exact: true })
    .fill('alice@example.invalid');
  await card.getByLabel('Foyer', { exact: true }).fill('Famille Martin');
  await card.getByLabel('Accompagnants maximum', { exact: true }).fill('2');
  await card.getByRole('button', { name: 'Enregistrer l’invité' }).click();
  await expect(
    page.getByRole('button', { name: 'Modifier Alice Martin' }),
  ).toBeVisible();
  await page
    .getByText('Importer un fichier CSV ou Excel', { exact: true })
    .click();
  await page.getByLabel('Fichier CSV ou Excel', { exact: true }).setInputFiles({
    name: 'invites.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(
      'name;email;household\nAlice doublon;alice@example.invalid;Martin\nBob Martin;bob@example.invalid;Martin',
    ),
  });
  await page.getByRole('button', { name: 'Confirmer l’import' }).click();
  await expect(
    page.getByRole('status', { name: 'État du carnet' }),
  ).toContainText('1 invités importés, 1 doublons ignorés');
  await page.getByLabel('Sélectionner Bob Martin', { exact: true }).check();
  await page.getByLabel('Nouveau groupe', { exact: true }).fill('Famille');
  await page.getByRole('button', { name: 'Appliquer le groupe' }).click();
  await expect(
    page.getByRole('status', { name: 'État du carnet' }),
  ).toContainText('Liste enregistrée');
  await page.reload();
  await page
    .getByRole('combobox', { name: 'Filtrer par groupe', exact: true })
    .selectOption('Famille');
  await expect(
    page.getByRole('button', { name: 'Modifier Bob Martin' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Modifier Alice Martin' }),
  ).toHaveCount(0);
  await expect(page.getByText('Invitée test', { exact: true })).toBeVisible();
  await page
    .getByRole('combobox', { name: 'Filtrer par groupe', exact: true })
    .selectOption('');
  await page
    .getByText('Importer un fichier CSV ou Excel', { exact: true })
    .click();
  await page
    .getByLabel('Fichier CSV ou Excel', { exact: true })
    .setInputFiles('tests/fixtures/invites.xlsx');
  await page.getByRole('button', { name: 'Confirmer l’import' }).click();
  await expect(
    page.getByRole('button', { name: 'Modifier Claire Durand' }),
  ).toBeVisible();
  await page.screenshot({
    path: info.outputPath('invites-desktop.png'),
    fullPage: true,
  });
  await page
    .getByRole('button', { name: 'Lien pour Alice Martin', exact: true })
    .click();
  await expect(
    page.getByRole('status', { name: 'État du carnet' }),
  ).toContainText('Lien personnel prêt');
  const personalUrl = await page
    .getByLabel('Lien personnel', { exact: true })
    .inputValue();
  await guest.goto(personalUrl);
  const reveal = guest.getByRole('button', {
    name: 'Passer l’introduction',
    exact: true,
  });
  if (await reveal.count()) await reveal.click();
  await expect(guest.locator('[name=guest_name]')).toHaveValue('Alice Martin');
  await expect(guest.locator('[name=guest_email]')).toHaveValue(
    'alice@example.invalid',
  );
  await guest.locator('[name=guest_companions]').fill('2');
  await guest.locator('[name=presence][value=yes]').check();
  await guest.locator('[name=consent]').check();
  await guest.getByRole('button', { name: /Envoyer/ }).click();
  await expect(guest.getByRole('status')).toContainText('bien été enregistrée');
  await page.reload();
  const alice = page.getByRole('row').filter({
    has: page.getByRole('button', {
      name: 'Modifier Alice Martin',
      exact: true,
    }),
  });
  await expect(alice).toContainText('Présent');
  await guest.reload();
  if (await reveal.count()) await reveal.click();
  await guest.locator('[name=presence][value=no]').check();
  await guest.locator('[name=consent]').check();
  await guest.getByRole('button', { name: /Envoyer/ }).click();
  await expect(guest.getByRole('status')).toContainText('bien été enregistrée');
  await page.reload();
  await expect(alice).toContainText('Absent');
  await expect(page.getByText('2 réponses', { exact: true })).toBeVisible();
  await page.screenshot({
    path: info.outputPath('invites-personnels-desktop.png'),
    fullPage: true,
  });
  await context.close();
});
