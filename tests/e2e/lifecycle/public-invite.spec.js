/**
 * Lifecycle: public game-invite flow.
 *
 * Scenario: anonymous (unauthenticated) visitor opens the share link
 * /game-invite/:gameId, sees the embedded GameCard, and submits an RSVP.
 *
 * The invite page signs the user in anonymously via Firebase Auth and
 * writes directly to the games doc, so this exercises both the public route
 * and the same updateGame service path that authenticated users use.
 */

import { expect, test } from '@playwright/test';
import { seedFresh } from './_setup/fixtures.js';
import { createGame, getGame } from './_setup/seed.js';

test.describe('Game lifecycle — public invite', () => {
    let world;
    let game;
    test.beforeEach(async () => {
        world = await seedFresh();
        game = await createGame({
            groupId: world.group.id,
            adminId: world.adminUid,
            playersInvited: world.players,
        });
    });

    test('anonymous visitor can join as a guest from a share link', async ({ page }) => {
        await page.goto(`/game-invite/${game.id}`);

        // Header strip with the SquadUp logo proves the page mounted.
        await expect(page.locator('img[alt="SquadUp"]')).toBeVisible();

        // The "Add me as a guest" tappable card opens an inline form.
        await page.getByRole('button', { name: /(not on the list|add as guest|add me as a guest|n[ãa]o est[ás]\s+na lista|adicionar(-me)? como convidado)/i }).first().click();

        await page.locator('input[type="text"]').first().fill('Walk-On Wendy');

        // Confirm via the localized "I'm In" button inside the guest form.
        await page.getByRole('button', { name: /(i'?m in|estou dentro)/i }).first().click();

        await expect.poll(async () => {
            const g = await getGame(game.id);
            return g?.playersIn.some((p) => p.guest === true && /wendy/i.test(p.firstName + ' ' + p.lastName));
        }, { timeout: 15_000 }).toBe(true);
    });

    test('shows a useful error for an unknown game id', async ({ page }) => {
        await page.goto('/game-invite/does-not-exist-12345');
        await expect(page.locator('img[alt="SquadUp"]')).toBeVisible();
        // Loaded state eventually surfaces the "game ended or gone" copy.
        await expect(
            page.getByText(/(this game has ended|game.*gone|este jogo terminou|n[ãa]o.*existe)/i),
        ).toBeVisible({ timeout: 15_000 });
    });
});
