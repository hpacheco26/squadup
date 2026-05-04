import { expect, test } from '@playwright/test';

/**
 * Public game-invite landing page (/game-invite/:gameId).
 *
 * Unauthenticated visitors see an auth gate (sign-in prompt) immediately,
 * so the logo and gate content are always rendered without any backend call.
 * Authenticated users trigger a Firestore read which we don't exercise here.
 * We keep assertions narrow: the logo renders and the page settles without
 * uncaught errors.
 */

const FAKE_GAME_ID = 'no-such-game-e2e';

test('renders the logo header even before backend response', async ({ page }) => {
    await page.goto(`/game-invite/${FAKE_GAME_ID}`);
    await expect(page.locator('img[alt="SquadUp"]')).toBeVisible();
});

test('page mounts without console errors and reaches a settled state', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto(`/game-invite/${FAKE_GAME_ID}`);

    // Either the spinner appears, or — once Firestore resolves — an error /
    // loaded card. Spinner has aria-hidden div with the styles.spinner class,
    // but a more durable signal is "the page contains some text".
    await expect(page.locator('body')).not.toBeEmpty({ timeout: 10_000 });

    expect(errors, `pageerror: ${errors.join(' | ')}`).toEqual([]);
});
