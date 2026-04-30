/**
 * Lifecycle: playing flow.
 *
 * Scenarios:
 *   1. Squad Up — admin balances teams; team1 + team2 arrays get populated.
 *   2. End Game — admin ends a game; the document is removed from Firestore.
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

        // Hop through pregame first so the gameStore subscription resolves
        // before we land on TeamsPage. Wait for a known PreGamePage element
        // (the InvitationBar pending count) instead of networkidle
        // — Firebase listeners keep the network non-idle indefinitely.
        await page.goto(`/pregame/${game.id}`);
        await page.getByRole('button', { name: /^(guest|convidado)$/i }).first().waitFor({ state: 'visible', timeout: 10_000 });
        await page.goto(`/teams/${game.id}`);

        await page.getByRole('button', { name: /^(squad up|formar equipas|formar times)$/i }).first().click();

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

        await page.goto(`/pregame/${game.id}`);
        await page.getByRole('button', { name: /^(guest|convidado)$/i }).first().waitFor({ state: 'visible', timeout: 10_000 });
        await page.goto(`/game/${game.id}`);

        await page.getByRole('button', { name: /^(end game|terminar jogo)$/i }).first().click();

        await expect.poll(async () => await getGame(game.id), { timeout: 15_000 }).toBeNull();
    });
});
