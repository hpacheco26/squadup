/**
 * Lifecycle: public game-invite flow.
 *
 * Scenario: anonymous (unauthenticated) visitor opens the share link
 * /game-invite/:gameId, sees the embedded GameCard, and submits an RSVP.
 *
 * The invite page signs the user in anonymously via Firebase Auth and
 * writes directly to the games doc, so this exercises both the public route
 * and the same updateGame service path that authenticated users use.
 *
 * Note: each test gets a fresh browser context via `test.use({ storageState: ... })`
 * so anonymous Firebase Auth state from a previous run never leaks across tests.
 */

import { expect, test } from '@playwright/test';
import { seedFresh } from './_setup/fixtures.js';
import { createGame, getGame } from './_setup/seed.js';

// Force a clean storage state for every test in this file.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Game lifecycle — public invite', () => {
    let world;
    let game;
    test.beforeEach(async ({ page }) => {
        world = await seedFresh();
        game = await createGame({
            groupId: world.group.id,
            adminId: world.adminUid,
            playersInvited: world.players,
        });
        // Belt-and-braces: also clear local/session storage in the page itself.
        await page.addInitScript(() => {
            try { localStorage.clear(); sessionStorage.clear(); } catch { /* noop */ }
        });
    });

    test('anonymous visitor can join as a guest from a share link', async ({ page }) => {
        await page.goto(`/game-invite/${game.id}`);

        await expect(page.locator('img[alt="SquadUp"]')).toBeVisible();

        // GameInvitePage's "guestCard" is a <button> whose accessible name
        // comes from the inner spans: "Not on the list?" + subtitle.
        await page.getByRole('button', { name: /(not on the list|n[aã]o est[aá]s? na lista)/i })
            .first()
            .click();

        await page.locator('input[type="text"]').first().fill('Walk-On Wendy');

        // Confirm via the localized "I'm In" button inside the guest form.
        await page.getByRole('button', { name: /^(i'?m in|i'?m in!|estou dentro)$/i }).first().click();

        await expect.poll(async () => {
            const g = await getGame(game.id);
            // GameInvitePage stores guests with `isGuest: true`; PreGamePage
            // uses `guest: true`. Accept either flag.
            return g?.playersIn.some((p) => (p.isGuest === true || p.guest === true)
                && /wendy/i.test(`${p.firstName} ${p.lastName}`));
        }, { timeout: 15_000 }).toBe(true);
    });

    test('shows a useful error for an unknown game id', async ({ page }) => {
        await page.goto('/game-invite/does-not-exist-12345');
        await expect(page.locator('img[alt="SquadUp"]')).toBeVisible();
        await expect(
            page.getByText(/(this game has ended|game.*gone|este jogo terminou|n[aã]o.*existe)/i),
        ).toBeVisible({ timeout: 15_000 });
    });
});
