import { expect, test } from '@playwright/test';

/**
 * End-to-end i18n: the language preference is persisted in
 * localStorage under "squadup-lang". Seeding it before navigation lets us
 * verify both locales render correctly through real React + Zustand wiring.
 */

async function withLang(page, lang) {
    await page.addInitScript((l) => {
        try { window.localStorage.setItem('squadup-lang', l); } catch { /* ignore */ }
    }, lang);
}

test.describe('i18n', () => {
    test('renders English copy when squadup-lang=en', async ({ page }) => {
        await withLang(page, 'en');
        await page.goto('/login');
        const html = (await page.content()).toLowerCase();
        // English-only words that don't appear in the Portuguese version.
        expect(html).toMatch(/login|password/);
    });

    test('renders Portuguese copy when squadup-lang=pt', async ({ page }) => {
        await withLang(page, 'pt');
        await page.goto('/login');
        const html = (await page.content()).toLowerCase();
        // Portuguese-only words.
        expect(html).toMatch(/(palavra-passe|entrar|registar)/);
    });

    test('falls back to English for unknown lang codes', async ({ page }) => {
        await withLang(page, 'xx-YY');
        await page.goto('/login');
        const html = (await page.content()).toLowerCase();
        expect(html).toMatch(/login|email/);
    });
});
