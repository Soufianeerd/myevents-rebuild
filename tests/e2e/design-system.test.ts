import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Design System - Session 01 Baseline', () => {
  // Baseline test on Desktop
  test.use({ viewport: { width: 1440, height: 1000 } });

  test('should render the design system catalog without a11y violations and match baseline', async ({
    page,
  }) => {
    await page.goto('/design-system');

    // Wait for page to be fully stable
    await page.waitForLoadState('networkidle');

    // Accessibility test (checking for serious/critical violations)
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();

    const violations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );

    expect(violations).toEqual([]);

    // Visual regression test
    // "Golden screenshot" for Session 01.
    await expect(page).toHaveScreenshot('design-system-baseline.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.05,
    });
  });

  test.describe('Responsive Behavior', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('should have no horizontal overflow on mobile', async ({ page }) => {
      await page.goto('/design-system');
      await page.waitForLoadState('networkidle');

      const boundingBox = await page.evaluate(() => {
        return {
          width: document.documentElement.scrollWidth,
          viewport: window.innerWidth,
        };
      });

      expect(boundingBox.width).toBeLessThanOrEqual(boundingBox.viewport);
    });
  });
});
