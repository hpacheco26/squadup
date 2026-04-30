import { expect, test } from '@playwright/test';

/**
 * Responsive sanity checks.
 *
 * Mobile is the primary target (Capacitor wraps the same web app for iOS and
 * Android), so any horizontal overflow on a 375px viewport is a bug. The
 * mobile-chrome and mobile-safari Playwright projects already simulate
 * Pixel 7 / iPhone 14, so this suite simply asserts no horizontal scroll.
 */

const CHECK_PAGES = ['/login', '/signup', '/privacy', '/terms', '/licenses'];

for (const url of CHECK_PAGES) {
    test(`no horizontal scroll on ${url}`, async ({ page }) => {
        await page.goto(url);
        const overflow = await page.evaluate(() => {
            const doc = document.documentElement;
            return doc.scrollWidth - doc.clientWidth;
        });
        // A few pixels of rounding wiggle room.
        expect(overflow).toBeLessThanOrEqual(2);
    });
}
