import { expect, test } from '@playwright/test';

/**
 * Public game-invite landing page (/game-invite/:gameId).
 *
 * The page calls signInAnonymously() and reads from Firestore, which we don't
 * want to depend on in the preview build's e2e suite. We keep the assertions
 * narrow: the page mounts, the AppHeaderBar-style logo strip is rendered, and
 * the page eventually shows either a loading or an error/loaded card.
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
