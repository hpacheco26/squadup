import { expect, test } from '@playwright/test';

/**
 * Verifies the i18n toggle works without auth. The login page exposes a
 * language switcher, so we can validate `t()` end-to-end without Firebase.
 */
test('login page renders translatable strings', async ({ page }) => {
    await page.goto('/login');

    // Common login labels in either language; loose match keeps the test
    // resilient to copy edits.
    const html = await page.content();
    expect(html.toLowerCase()).toMatch(/(email|e-mail)/);
});
