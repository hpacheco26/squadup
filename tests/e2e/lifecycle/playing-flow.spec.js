/**
 * Lifecycle: playing flow.
 *
 * Scenarios:
 *   1. Squad Up — admin balances teams; team1 + team2 arrays get populated.
 *   2. End Game — admin ends a game with a recorded score; the game document
 *      is removed from Firestore (and player ranks would be updated, but we
 *      assert only on the deletion to keep the test deterministic).
 */

import { expect, test } from '@playwright/test';
import { seedFresh, loginAs } from './_setup/fixtures.js';
import { createGame, getGame } from './_setup/seed.js';

test.describe('Game lifecycle — playing flow', () => {
    let world;
    test.beforeEach(async ({ page }) => {
        world = await seedFresh();
        await loginAs(page);
    });

    test('Squad Up balances players into two teams', async ({ page }) => {
        const game = await createGame({
            groupId: world.group.id,
            adminId: world.adminUid,
            minPlayers: 4,
            playersPerTeam: 3,
            playersIn: world.players,
            status: 'confirmed',
        });

        await page.goto(`/teams/${game.id}`);

        await page.getByRole('button', { name: /(squad up|formar equipas)/i }).first().click();

        await expect.poll(async () => {
            const g = await getGame(game.id);
            return (g?.team1?.length || 0) + (g?.team2?.length || 0);
        }, { timeout: 15_000 }).toBeGreaterThanOrEqual(world.players.length);

        const after = await getGame(game.id);
        expect(after.team1.length).toBeGreaterThan(0);
        expect(after.team2.length).toBeGreaterThan(0);
    });

    test('End Game deletes the game document', async ({ page }) => {
        const half = Math.ceil(world.players.length / 2);
        const game = await createGame({
            groupId: world.group.id,
            adminId: world.adminUid,
            playersIn: world.players,
            team1: world.players.slice(0, half),
            team2: world.players.slice(half),
            team1Goals: 3,
            team2Goals: 1,
            status: 'confirmed',
        });

        await page.goto(`/game/${game.id}`);

        await page.getByRole('button', { name: /(end game|terminar jogo)/i }).first().click();

        // Some builds show a confirmation modal; accept either path.
        const confirm = page.getByRole('button', {
            name: /(yes,?\s*end game|sim,?\s*terminar jogo|confirm|confirmar)/i,
        });
        if (await confirm.isVisible({ timeout: 1500 }).catch(() => false)) {
            await confirm.click();
        }

        await expect.poll(async () => await getGame(game.id), { timeout: 15_000 }).toBeNull();
    });
});
