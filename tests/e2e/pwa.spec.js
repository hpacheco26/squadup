import { expect, test } from '@playwright/test';

/**
 * PWA / static asset wiring. Catches regressions where the build stops
 * emitting the manifest, the service worker, or the SquadUp icons.
 */

test('manifest is referenced from the HTML shell', async ({ page }) => {
    await page.goto('/');
    const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(manifestHref).toBeTruthy();
});

test('manifest file resolves and is valid JSON', async ({ page, baseURL }) => {
    await page.goto('/');
    const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
    const url = new URL(manifestHref, baseURL).toString();
    const res = await page.request.get(url);
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.name || json.short_name).toBeTruthy();
});

test('firebase-messaging-sw.js is served', async ({ request, baseURL }) => {
    const res = await request.get(`${baseURL}/firebase-messaging-sw.js`);
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain('firebase');
});

test('PWA icons are served', async ({ request, baseURL }) => {
    for (const icon of ['/pwa-192x192.png', '/pwa-512x512.png']) {
        const res = await request.get(`${baseURL}${icon}`);
        expect(res.status(), `Missing ${icon}`).toBe(200);
    }
});
