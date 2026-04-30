/**
 * Lifecycle: RSVP flow (in-app authenticated PreGamePage).
 *
 * Scenarios:
 *   1. Player swipes themselves IN — moves from playersInvited to playersIn,
 *      and the game status flips to 'confirmed' once minPlayers is reached.
 *   2. Player swipes themselves OUT — moves to playersOut and the game
 *      drops back to 'open' if the threshold is no longer met.
 *   3. Admin adds a guest — guest doc appears in playersIn with guest=true.
 */

import { expect, test } from '@playwright/test';
import { seedFresh, loginAs } from './_setup/fixtures.js';
import { createGame, getGame } from './_setup/seed.js';

test.describe('Game lifecycle — RSVP flow', () => {
    let world;
    test.beforeEach(async ({ page }) => {
        world = await seedFresh();
        await loginAs(page);
    });

    test('player can RSVP IN and confirm the game', async ({ page }) => {
        const others = world.players.filter((p) => p.id !== world.adminPlayer.id);
        // Pre-fill almost to the threshold so the admin's IN flips status.
        const game = await createGame({
            groupId: world.group.id,
            adminId: world.adminUid,
            minPlayers: 4,
            playersInvited: [world.adminPlayer],
            playersIn: others.slice(0, 3),
            status: 'open',
        });

        await page.goto(`/pregame/${game.id}`);

        // Click the "I'm In" action on the admin's own row. The PreGamePage
        // surfaces it via the SwipePlayer component; simplest selector is the
        // localized button text scoped to the user's name.
        await page.getByRole('button', { name: /(i'?m in|estou dentro|i'?m in!)/i }).first().click();

        await expect.poll(async () => {
            const g = await getGame(game.id);
            return g?.playersIn.some((p) => p.userId === world.adminUid);
        }, { timeout: 10_000 }).toBe(true);

        const after = await getGame(game.id);
        expect(after.status).toBe('confirmed');
    });

    test('player can RSVP OUT and unconfirm the game', async ({ page }) => {
        const others = world.players.filter((p) => p.id !== world.adminPlayer.id);
        const game = await createGame({
            groupId: world.group.id,
            adminId: world.adminUid,
            minPlayers: 4,
            playersIn: [world.adminPlayer, ...others.slice(0, 3)],
            status: 'confirmed',
        });

        await page.goto(`/pregame/${game.id}`);

        await page.getByRole('button', { name: /(i'?m out|estou fora)/i }).first().click();

        await expect.poll(async () => {
            const g = await getGame(game.id);
            return g?.playersOut.some((p) => p.userId === world.adminUid);
        }, { timeout: 10_000 }).toBe(true);

        const after = await getGame(game.id);
        expect(after.status).toBe('open');
    });

    test('admin can add a guest player', async ({ page }) => {
        const game = await createGame({
            groupId: world.group.id,
            adminId: world.adminUid,
            playersInvited: world.players,
        });

        await page.goto(`/pregame/${game.id}`);

        await page.getByRole('button', { name: /(add guest|adicionar convidado)/i }).first().click();

        // Modal opens with first/last name inputs.
        await page.locator('input[type="text"]').nth(0).fill('Greta');
        await page.locator('input[type="text"]').nth(1).fill('Guest');
        await page.getByRole('button', { name: /(add|adicionar|done|conclu[ií]r|save|guardar)/i }).first().click();

        await expect.poll(async () => {
            const g = await getGame(game.id);
            return g?.playersIn.some((p) => p.guest === true && p.firstName === 'Greta');
        }, { timeout: 10_000 }).toBe(true);
    });
});
