import { expect, test } from '@playwright/test';

/**
 * Public legal pages: privacy / terms / open-source licenses.
 *
 * These are static React pages that don't touch Firebase, so they're safe to
 * exercise end-to-end against the preview build.
 */

const PAGES = [
    { url: '/privacy', titleRegex: /(privacy|privacidade)/i },
    { url: '/terms', titleRegex: /(terms|termos)/i },
    { url: '/licenses', titleRegex: /(licenses|licen[çc]as)/i },
];

for (const { url, titleRegex } of PAGES) {
    test.describe(`Legal page: ${url}`, () => {
        test('renders heading', async ({ page }) => {
            await page.goto(url);
            await expect(page.locator('h1')).toContainText(titleRegex);
        });

        test('has a back button in the header', async ({ page }) => {
            await page.goto(url);
            // Header back button is the first <button> on the page.
            await expect(page.locator('button').first()).toBeVisible();
        });
    });
}

test('licenses page lists at least a few dependencies', async ({ page }) => {
    await page.goto('/licenses');
    const html = await page.content();
    // Expect a few core deps to be mentioned.
    expect(html.toLowerCase()).toMatch(/react/);
    expect(html.toLowerCase()).toMatch(/firebase/);
});
