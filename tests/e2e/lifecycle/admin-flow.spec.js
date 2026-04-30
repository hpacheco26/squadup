/**
 * Lifecycle: admin flow.
 *
 * Scenarios:
 *   1. Admin creates a brand-new game from the group page.
 *   2. Admin cancels (deletes) an existing game from its settings page.
 */

import { expect, test } from '@playwright/test';
import { seedFresh, loginAs } from './_setup/fixtures.js';
import { createGame, getGame } from './_setup/seed.js';

test.describe('Game lifecycle — admin flow', () => {
    let world;
    test.beforeEach(async ({ page }) => {
        world = await seedFresh();
        await loginAs(page);
    });

    test('admin can schedule a new game', async ({ page }) => {
        await page.goto(`/groups/${world.group.id}/games/new`);

        // Form ships with sensible defaults (today's date, 20:00, 5-a-side).
        // Filling Location is enough to submit.
        await page.getByPlaceholder(/^location$/i).fill('Lifecycle Test Pitch');

        await page.getByRole('button', { name: /^(schedule game|agendar jogo|create game|criar jogo)$/i }).click();

        // App routes to /pregame/{newGameId} after create.
        await page.waitForURL(/\/pregame\/(.+)/, { timeout: 10_000 });
        const url = new URL(page.url());
        const newGameId = url.pathname.split('/').pop();

        // Verify the doc exists for the right group.
        const created = await getGame(newGameId);
        expect(created).not.toBeNull();
        expect(created.groupId).toBe(world.group.id);
        expect(created.location).toBe('Lifecycle Test Pitch');
    });

    test('admin can cancel an existing game', async ({ page }) => {
        const game = await createGame({
            groupId: world.group.id,
            adminId: world.adminUid,
            playersInvited: world.players,
        });

        await page.goto(`/games/${game.id}/settings`);

        // The "Cancel Game" SettingsRow lives in the Danger Zone toward the
        // bottom of the form. SettingsRow renders as a div, not a button.
        const cancelRow = page.getByText(/^cancel game$/i).first();
        await cancelRow.scrollIntoViewIfNeeded();
        await cancelRow.click();

        // Confirmation modal opens: the danger button inside the BottomSheet
        // is a real <button> with the same label.
        const confirmBtn = page.getByRole('button', { name: /^cancel game$/i });
        await confirmBtn.waitFor({ state: 'visible', timeout: 5_000 });
        await confirmBtn.click();

        await expect.poll(async () => await getGame(game.id), { timeout: 10_000 }).toBeNull();
    });
});
