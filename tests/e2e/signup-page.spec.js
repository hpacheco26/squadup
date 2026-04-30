import { expect, test } from '@playwright/test';

/**
 * Signup page coverage.
 *
 * Same constraint as login: no real auth backend in CI, so we only verify
 * the form surface and client-side validation (password mismatch).
 */

test.describe('Signup page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/signup');
    });

    test('renders all required fields', async ({ page }) => {
        // Two text inputs (first/last name) + email + two passwords.
        await expect(page.locator('input[type="text"]')).toHaveCount(2);
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toHaveCount(2);
    });

    test('shows password mismatch error when passwords differ', async ({ page }) => {
        await page.locator('input[type="text"]').nth(0).fill('Ada');
        await page.locator('input[type="text"]').nth(1).fill('Lovelace');
        await page.locator('input[type="email"]').fill('ada@example.test');
        await page.locator('input[type="password"]').nth(0).fill('correcthorse1');
        await page.locator('input[type="password"]').nth(1).fill('different-pwd-2');

        await page.getByRole('button', { name: /sign up|registar/i }).click();

        // Mismatch message comes from i18n (en: "Passwords do not match",
        // pt: "As palavras-passe não coincidem"). Match either via "match" / "coincid".
        await expect(page.getByText(/(do not match|n[ãa]o coincid)/i)).toBeVisible();
    });

    test('login link navigates back to /login', async ({ page }) => {
        await page.getByRole('link', { name: /^(login|entrar)$/i }).click();
        await expect(page).toHaveURL(/\/login$/);
    });
});
