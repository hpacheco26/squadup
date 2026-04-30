import { expect, test } from '@playwright/test';

/**
 * Protected routes must redirect unauthenticated visitors to /login.
 *
 * ProtectedRoute.js wraps every authenticated route with this behavior; this
 * suite parametrizes over the full router map so a regression in one route
 * (or in the wrapper itself) is caught with a clear failure message.
 */

const PROTECTED_ROUTES = [
    '/',
    '/pregame',
    '/pregame/abc123',
    '/teams',
    '/teams/abc123',
    '/game',
    '/game/abc123',
    '/rank',
    '/settings',
    '/groups/abc123',
    '/groups/abc123/settings',
    '/groups/abc123/games/new',
    '/games/abc123/settings',
    '/payments/abc123',
    '/join/SOMECODE',
];

for (const path of PROTECTED_ROUTES) {
    test(`redirects ${path} to /login when unauthenticated`, async ({ page }) => {
        await page.goto(path, { waitUntil: 'domcontentloaded' });
        await expect(page).toHaveURL(/\/login$/, { timeout: 10_000 });
    });
}
