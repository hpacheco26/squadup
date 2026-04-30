/**
 * Lifecycle: RSVP flow (in-app authenticated PreGamePage).
 *
 * Scenarios:
 *   1. Player swipes themselves IN — moves from playersInvited to playersIn,
 *      and the game status flips to 'confirmed' once minPlayers is reached.
 *   2. Player swipes themselves OUT — moves to playersOut and the game
 *      drops back to 'open' if the threshold is no longer met.
 *   3. Admin adds a guest — guest doc appears in playersIn with guest=true.
 *
 * SwipePlayer exposes visually-hidden a11y buttons for the swipe gesture
 * (WCAG 2.5.1). Labels are direction-based:
 *   - "Swipe {name} left"  → fires onLeft  (i.e. leftSwipe prop)
 *   - "Swipe {name} right" → fires onRight (i.e. rightSwipe prop)
 *
 * What each direction *does* depends on the page. On PreGamePage:
 *   - Invited list:  rightSwipe={handlePlayerIn},  leftSwipe={handlePlayerOut}
 *   - In list:       leftSwipe ={handlePlayerOut}, rightSwipe={handleQuickGuest}
 *   - Out list:      rightSwipe={handlePlayerIn}
 */

import { expect, test } from '@playwright/test';
import { seedFresh, loginAs, ADMIN } from './_setup/fixtures.js';
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

        // Invited list: rightSwipe → handlePlayerIn. The sr-only swipe button
        // overlaps the visible swipe card; dispatch the DOM click directly
        // to bypass Playwright's hit-test (the swipe surface intercepts).
        const adminRow = page.locator(`[data-player-id="${world.adminPlayer.id}"]`);
        await adminRow.waitFor({ state: 'visible' });
        await adminRow.getByRole('button', { name: new RegExp(`swipe ${ADMIN.firstName} ${ADMIN.lastName} right`, 'i') })
            .dispatchEvent('click');

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

        // In list: leftSwipe → handlePlayerOut. dispatchEvent bypasses the
        // foreground card's pointer interception.
        const adminRow = page.locator(`[data-player-id="${world.adminPlayer.id}"]`);
        await adminRow.waitFor({ state: 'visible' });
        await adminRow.getByRole('button', { name: new RegExp(`swipe ${ADMIN.firstName} ${ADMIN.lastName} left`, 'i') })
            .dispatchEvent('click');

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

        // PreGamePage header: <button> with "Guest" label opens the modal.
        await page.getByRole('button', { name: /^(guest|convidado)$/i }).first().click();

        // PlayerModal: First Name + Last Name textboxes (placeholder = name)
        // and an "Add New Player" submit button.
        const modal = page.getByRole('heading', { name: /(add new player|adicionar novo jogador)/i }).locator('..').locator('..');
        await modal.getByRole('textbox', { name: /(first name|nome)/i }).fill('Greta');
        await modal.getByRole('textbox', { name: /(last name|apelido|sobrenome)/i }).fill('Guest');
        await modal.getByRole('button', { name: /^(add new player|adicionar novo jogador)$/i }).click();

        await expect.poll(async () => {
            const g = await getGame(game.id);
            return g?.playersIn.some((p) => p.guest === true && p.firstName === 'Greta');
        }, { timeout: 10_000 }).toBe(true);
    });
});
