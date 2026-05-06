/**
 * Lifecycle: game-invite link flow.
 *
 * Scenario A: unauthenticated visitor opens the share link and sees the
 * sign-in gate (anonymous access is no longer supported).
 *
 * Scenario B: authenticated user opens the link and can swipe to respond.
 *
 * Note: each test gets a fresh browser context via `test.use({ storageState: ... })`
 * so auth state from a previous run never leaks across tests.
 */

import { expect, test } from '@playwright/test';
import { seedFresh, loginAs, ADMIN } from './_setup/fixtures.js';
import { createGame, getGame } from './_setup/seed.js';

// Force a clean storage state for every test in this file.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Game lifecycle — invite link', () => {
    let world;
    let game;
    test.beforeEach(async ({ page }) => {
        world = await seedFresh();
        game = await createGame({
            groupId: world.group.id,
            adminId: world.adminUid,
            playersInvited: world.players,
        });
        await page.addInitScript(() => {
            try { localStorage.clear(); sessionStorage.clear(); } catch { /* noop */ }
        });
    });

    test('unauthenticated visitor sees the sign-in gate', async ({ page }) => {
        await page.goto(`/game-invite/${game.id}`);

        // Logo header is always visible.
        await expect(page.locator('img[alt="SquadUp"]')).toBeVisible();

        // Auth gate heading must appear.
        await expect(
            page.getByText(/(sign in to respond|inicia sess[aã]o para responder)/i),
        ).toBeVisible({ timeout: 10_000 });

        // Google and account-creation buttons must be present.
        await expect(
            page.getByRole('button', { name: /(login with google|iniciar.*google)/i }),
        ).toBeVisible();
        await expect(
            page.getByRole('button', { name: /(create account|criar conta)/i }),
        ).toBeVisible();
    });

    test('authenticated user can respond IN from the invite link', async ({ page }) => {
        await loginAs(page);
        await page.goto(`/game-invite/${game.id}`);

        await expect(page.locator('img[alt="SquadUp"]')).toBeVisible();

        // Wait for the player list to render.
        await expect(
            page.getByText(/(find your name|encontra o teu nome)/i),
        ).toBeVisible({ timeout: 15_000 });

        // The admin player (Ada Admin) is in the invited list — swipe right (IN).
        // Use data-player-id attribute (on SwipePlayer's container) + text filter.
        const adminRow = page.locator('[data-player-id]').filter({ hasText: /ada/i }).first();
        await adminRow.waitFor({ state: 'visible', timeout: 10_000 });
        await adminRow.dragTo(adminRow, {
            sourcePosition: { x: 20, y: 20 },
            targetPosition: { x: 200, y: 20 },
        });

        // Response banner should appear confirming IN status.
        await expect.poll(async () => {
            const g = await getGame(game.id);
            return g?.playersIn.some((p) => p.userId === world.adminUid);
        }, { timeout: 15_000 }).toBe(true);
    });

    test('authenticated user sees error for an unknown game id', async ({ page }) => {
        await loginAs(page);
        await page.goto('/game-invite/does-not-exist-12345');
        await expect(page.locator('img[alt="SquadUp"]')).toBeVisible();
        await expect(
            page.getByText(/(this game has ended|game.*gone|este jogo terminou|n[aã]o.*existe)/i),
        ).toBeVisible({ timeout: 15_000 });
    });
});

