import { expect, test } from '@playwright/test';

/**
 * Login page UX coverage.
 *
 * Rendered against the static preview build with no Firebase backend, so we
 * verify the surface (fields, links, copy, basic validation) — not the
 * round-trip submit which requires a real auth backend.
 */

test.describe('Login page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
    });

    test('renders translatable strings', async ({ page }) => {
        const html = await page.content();
        expect(html.toLowerCase()).toMatch(/(email|e-mail)/);
    });

    test('shows email + password inputs and primary submit button', async ({ page }) => {
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
        await expect(page.getByRole('button', { name: /^(login|entrar)$/i })).toBeVisible();
    });

    test('exposes Google login option', async ({ page }) => {
        await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
    });

    test('signup link navigates to /signup', async ({ page }) => {
        await page.getByRole('link', { name: /sign up|registar/i }).click();
        await expect(page).toHaveURL(/\/signup$/);
    });

    test('blocks submit when required fields are empty (HTML5 validation)', async ({ page }) => {
        await page.getByRole('button', { name: /^(login|entrar)$/i }).click();
        // Still on /login because the form did not submit.
        await expect(page).toHaveURL(/\/login$/);
    });
});
