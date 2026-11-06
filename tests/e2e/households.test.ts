import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import AxeBuilder from '@axe-core/playwright';

test('organizer reconciles a general RSVP and manages named household members without losing replies', async ({
  page,
  browser,
}, info) => {
  test.setTimeout(120_000);
  await page.goto('/inscription');
  await page.getByLabel('Prénom', { exact: true }).fill('Camille');
  await page.getByLabel('Nom', { exact: true }).fill('Martin');
  await page
    .locator('[name=email]')
    .fill(`households.${randomUUID()}@example.invalid`);
  await page.locator('[name=password]').fill('HouseholdsPassword123!Long');
  await page
    .locator('[name=passwordConfirmation]')
    .fill('HouseholdsPassword123!Long');
  await page.locator('button[type=submit]').click();
  await expect(page).toHaveURL('/dashboard');
  await page.goto('/events/new');
  await page.locator('[name=name]').fill('Les retrouvailles');
  await page.locator('[name=startAt]').fill('2027-07-04T18:00');
  await page.getByRole('button', { name: 'Créer l’événement' }).click();
  await expect(page).toHaveURL('/dashboard');
  await page.getByRole('link', { name: /Gérer/ }).click();
  await expect(page).toHaveURL(/\/events\/[0-9a-f-]+$/);
  const eventUrl = page.url();
  await page.getByRole('button', { name: 'Activer la démonstration' }).click();
  await expect(page.getByRole('status')).toContainText('Démonstration activée');
  await page.goto(`${eventUrl}/studio`);
  await page.getByRole('button', { name: 'Ajouter une question RSVP' }).click();
  await page.getByLabel('Libellé du champ 1').fill('Votre foyer');
  await page.getByLabel('Relier cette réponse au foyer de l’invité').check();
  await page.getByRole('button', { name: 'Publier', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Copier', exact: true }),
  ).toBeVisible();
  const link = (await page.locator('a[href*="/i/"]').getAttribute('href'))!;
  const context = await browser.newContext();
  const visitor = await context.newPage();
  await visitor.goto(link);
  await visitor
    .getByRole('button', { name: 'Ouvrir l’invitation', exact: true })
    .click();
  await visitor.locator('[name=guest_name]').fill('Léa Martin');
  await visitor.locator('[name=guest_email]').fill('lea@example.invalid');
  await visitor.locator('[name=presence][value=no]').check();
  await visitor
    .getByLabel('Votre foyer', { exact: true })
    .fill('Famille Martin');
  await visitor.locator('[name=consent]').check();
  await visitor.getByRole('button', { name: /Envoyer/ }).click();
  await expect(visitor.getByRole('status')).toContainText(/enregistr|merci/i);
  await page.goto(`${eventUrl}/invites`);
  for (const name of ['Léa Martin', 'Louis Martin']) {
    await page.getByRole('button', { name: 'Ajouter un invité' }).click();
    const form = page
      .locator('form')
      .filter({ has: page.getByRole('heading', { name: 'Fiche invité' }) });
    await form.getByLabel('Nom', { exact: true }).fill(name);
    await form.getByLabel('Statut manuel').selectOption('sent');
    await form.getByRole('button', { name: 'Enregistrer l’invité' }).click();
    await expect(form).toHaveCount(0);
  }
  await expect(page.getByText(/2 invités à relancer/)).toBeVisible();
  await page.getByRole('button', { name: 'Modifier Léa Martin' }).click();
  await page
    .getByLabel('Contact destinataire')
    .selectOption({ label: 'Léa Martin' });
  await page
    .getByRole('button', { name: 'Rattacher la réponse', exact: true })
    .click();
  await expect(page.getByRole('status', { name: 'État du carnet' })).toHaveText(
    'Réponse rattachée au carnet.',
  );
  await expect(page.getByText(/1 invités à relancer/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Fiche invité' })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole('region', { name: 'Rattacher les réponses' }),
  ).toHaveCount(0);
  await page
    .getByRole('checkbox', { name: 'Sélectionner les invités affichés' })
    .check();
  await page
    .getByLabel('Nouveau foyer', { exact: true })
    .fill('Famille Martin');
  await page.getByRole('button', { name: 'Appliquer le foyer' }).click();
  const family = page.getByRole('article', {
    name: 'Foyer Famille Martin',
    exact: true,
  });
  await expect(family).toContainText('2 membres nommés');
  await expect(family).toContainText('1 non');
  await expect(family).toContainText('1 sans réponse');
  await family.getByText('Voir les membres et leurs réponses').click();
  await expect(
    family.getByRole('listitem').filter({ hasText: 'Léa Martin' }),
  ).toContainText('Absent');
  await family
    .getByRole('button', { name: 'Renommer Famille Martin', exact: true })
    .click();
  await family.getByLabel('Nouveau nom du foyer').fill('Les Martin');
  await family.getByRole('button', { name: 'Enregistrer le nom' }).click();
  const renamed = page.getByRole('article', {
    name: /^Foyer Les Martin$/i,
  });
  await expect(renamed).toBeVisible();
  await page.reload();
  await expect(renamed).toBeVisible();
  await renamed.getByText('Voir les membres et leurs réponses').click();
  await page.setViewportSize({ width: 1440, height: 1050 });
  const collections = page.getByRole('region', {
    name: 'Foyers & groupes',
    exact: true,
  });
  await collections.scrollIntoViewIfNeeded();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({
    path: info.outputPath('foyers-desktop.png'),
    fullPage: true,
  });
  await collections.screenshot({
    path: info.outputPath('foyers-cartes-desktop.png'),
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await renamed.screenshot({
    path: info.outputPath('foyers-cartes-mobile.png'),
  });
  await page.screenshot({
    path: info.outputPath('foyers-mobile.png'),
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1050 });
  await renamed
    .getByRole('button', { name: 'Voir les invités de Les Martin' })
    .click();
  await renamed
    .getByRole('button', { name: 'Renommer Les Martin', exact: true })
    .click();
  await renamed.getByLabel('Nouveau nom du foyer').fill('LES MARTIN');
  await renamed.getByRole('button', { name: 'Enregistrer le nom' }).click();
  await expect(
    page.getByRole('combobox', { name: /^Filtrer par foyer/ }),
  ).toHaveValue('LES MARTIN');
  await page.getByRole('combobox', { name: /^Statut/ }).selectOption('no');
  await expect(
    page.getByRole('button', { name: 'Modifier Léa Martin' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Modifier Louis Martin' }),
  ).toHaveCount(0);
  await page.getByRole('combobox', { name: /^Statut/ }).selectOption('');
  await page
    .getByRole('checkbox', { name: 'Sélectionner Louis Martin', exact: true })
    .check();
  await page.getByLabel('Rechercher un invité', { exact: true }).fill('Léa');
  await expect(
    page.getByRole('button', { name: 'Supprimer la sélection' }),
  ).toHaveCount(0);
  await page.getByLabel('Rechercher un invité', { exact: true }).fill('');
  page.once('dialog', (dialog) => dialog.accept());
  await renamed
    .getByRole('button', { name: /^Dissoudre Les Martin$/i })
    .click();
  await expect(renamed).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByText('Aucun foyer pour le moment', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Modifier Léa Martin' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Modifier Louis Martin' }),
  ).toBeVisible();
  await expect(
    page.getByRole('cell', { name: 'Famille Martin', exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByText(/1 invités à relancer/)).toBeVisible();
  await page.getByRole('button', { name: 'Modifier Léa Martin' }).click();
  await page.getByRole('button', { name: 'Détacher la réponse' }).click();
  await expect(page.getByRole('heading', { name: 'Fiche invité' })).toHaveCount(
    0,
  );
  await expect(page.getByText(/2 invités à relancer/)).toBeVisible();
  await page
    .getByLabel('Contact destinataire')
    .selectOption({ label: 'Léa Martin' });
  await page
    .getByRole('button', { name: 'Rattacher la réponse', exact: true })
    .click();
  await expect(page.getByText(/1 invités à relancer/)).toBeVisible();
  await expect(
    page.getByText('Aucun foyer pour le moment', { exact: true }),
  ).toBeVisible();
  await context.close();
});
