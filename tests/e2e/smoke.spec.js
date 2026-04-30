import { expect, test } from '@playwright/test';

/**
 * Smoke test: the unauthenticated app boots and lands on the login page.
 *
 * This intentionally avoids hitting Firebase. It guards against build-time
 * regressions (bundle errors, router misconfig, missing assets) and gives CI a
 * fast green/red signal without any backend setup.
 */
test('app boots and redirects to /login when not authenticated', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Router should kick the user to /login via ProtectedRoute.
    await expect(page).toHaveURL(/\/login$/, { timeout: 10_000 });

    // Sanity: title is set.
    await expect(page).toHaveTitle(/SquadUp/i);

    expect(errors, `Page errors during boot: ${errors.join(' | ')}`).toEqual([]);
});
