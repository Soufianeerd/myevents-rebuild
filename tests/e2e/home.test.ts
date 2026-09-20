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

for (const width of [360, 390, 1440]) {
  test(`home is accessible without horizontal overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    await expect(
      page.getByRole('img', {
        name: 'Fleurs blanches et feuillage autour d’une table de cérémonie en plein air',
      }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const audit = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();
    expect(audit.violations).toEqual([]);
  });
}

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

test('each invitation model opens its own accessible demo without collecting responses', async ({
  page,
}) => {
  for (const [name, slug, program] of [
    ['Jardin lumière', 'jardin-lumiere', 'La cérémonie'],
    ['Soirée grenat', 'soiree-grenat', 'La cérémonie du henné'],
    ['Les beaux jours', 'les-beaux-jours', 'On se retrouve'],
  ]) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page
      .getByRole('link', { name: `Découvrir le modèle ${name}`, exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`/modeles/${slug}$`));
    await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();
    const opening = page.getByText('Ouvrir l’invitation', { exact: true });
    await opening.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText(program, { exact: true })).toBeVisible();
    await expect(
      page.getByText('Aucune réponse n’est collectée ici.', { exact: false }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const audit = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();
    expect(audit.violations).toEqual([]);
    await page.getByRole('link', { name: 'Retour aux modèles' }).click();
    await expect(page).toHaveURL(/\/#modeles$/);
  }
});

test('invitation motion respects reduced motion and unknown models return 404', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/modeles/jardin-lumiere');
  await page.getByText('Ouvrir l’invitation', { exact: true }).click();
  const content = page.locator('details > div');
  expect(
    await content.evaluate(
      (element) => getComputedStyle(element).animationName,
    ),
  ).toBe('none');
  const response = await page.goto('/modeles/inconnu');
  expect(response?.status()).toBe(404);
});
