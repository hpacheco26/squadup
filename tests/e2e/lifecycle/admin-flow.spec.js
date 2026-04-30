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

        // Form is pre-filled with sensible defaults (today's date, 20:00, etc.).
        // Just override the location and submit.
        const dateInput = page.locator('input[type="date"]').first();
        const timeInput = page.locator('input[type="time"]').first();
        await dateInput.fill('2026-12-15');
        await timeInput.fill('19:30');

        const locationInput = page.locator('input[type="text"]').first();
        await locationInput.fill('Lifecycle Test Pitch');

        await page.getByRole('button', { name: /^(create game|schedule game|criar jogo|agendar jogo)$/i }).click();

        // App routes back to the group page after create.
        await page.waitForURL(/\/groups\//, { timeout: 10_000 });

        // Verify a game was actually persisted for this group.
        // Poll Firestore via our admin handle until at least one doc exists.
        await expect.poll(async () => {
            // Use a quick fetch through the Firestore REST emulator endpoint.
            const res = await fetch(
                `http://127.0.0.1:8080/v1/projects/squadup-a3a55/databases/(default)/documents/games`,
            );
            const json = await res.json();
            const docs = json.documents || [];
            return docs.filter((d) => d.fields?.groupId?.stringValue === world.group.id).length;
        }, { timeout: 10_000 }).toBeGreaterThanOrEqual(1);
    });

    test('admin can cancel an existing game', async ({ page }) => {
        const game = await createGame({
            groupId: world.group.id,
            adminId: world.adminUid,
            playersInvited: world.players,
        });

        await page.goto(`/games/${game.id}/settings`);

        // The "Cancel Game" button lives in a danger-zone section toward the
        // bottom of the form. Click it then confirm in the modal.
        await page.getByRole('button', { name: /(cancel game|cancelar jogo)/i }).first().click();
        await page.getByRole('button', { name: /(yes,?\s*cancel game|sim,?\s*cancelar jogo)/i }).click();

        // The game document should disappear within a few seconds.
        await expect.poll(async () => await getGame(game.id), { timeout: 10_000 }).toBeNull();
    });
});
