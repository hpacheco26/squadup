import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the GAME LIFECYCLE e2e suite.
 *
 * These tests need a real Firebase backend, so we point the app at the local
 * Firebase emulator suite (auth + firestore). The recommended invocation is:
 *
 *   npm run test:e2e:lifecycle
 *
 * which wraps this config in `firebase emulators:exec` so the emulators are
 * guaranteed to be up before the webServer boots and torn down after.
 *
 * Differences vs. playwright.config.js:
 *  - Separate testDir (./tests/e2e/lifecycle) so the read-only public-surface
 *    suite stays fast and emulator-free.
 *  - Single chromium project (lifecycle scenarios are slow; cross-browser
 *    matrix would multiply runtime without catching real bugs).
 *  - webServer rebuilds with VITE_USE_FIREBASE_EMULATOR=1 so the bundled JS
 *    talks to the emulator endpoints instead of production Firebase.
 *  - globalSetup seeds a deterministic test user + group + roster.
 *  - serial workers — many specs share the same emulator state and would race.
 */

const PORT = Number(process.env.LIFECYCLE_PORT) || 4174;
const FIREBASE_HOST = process.env.FIREBASE_EMULATOR_HOST || '127.0.0.1';
const AUTH_PORT = Number(process.env.FIREBASE_AUTH_EMULATOR_PORT) || 9099;
const FIRESTORE_PORT = Number(process.env.FIRESTORE_EMULATOR_PORT) || 8080;

export default defineConfig({
    testDir: './tests/e2e/lifecycle',
    timeout: 60_000,
    expect: { timeout: 8_000 },
    fullyParallel: false,
    workers: 1,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
    globalSetup: './tests/e2e/lifecycle/_setup/global-setup.js',
    use: {
        baseURL: `http://127.0.0.1:${PORT}`,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    projects: [
        { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    ],
    webServer: {
        // Use vite directly so we don't depend on `npm run -- --port` arg
        // forwarding (which has been flaky on Windows + PowerShell).
        // Bind to 127.0.0.1 explicitly so the baseURL probe matches the
        // listening socket (vite preview defaults to localhost only).
        command: `npm run build && npx vite preview --host 127.0.0.1 --port ${PORT} --strictPort`,
        url: `http://127.0.0.1:${PORT}`,
        reuseExistingServer: !process.env.CI,
        timeout: 300_000,
        env: {
            VITE_USE_FIREBASE_EMULATOR: '1',
            VITE_FIREBASE_EMULATOR_HOST: FIREBASE_HOST,
            VITE_FIREBASE_AUTH_PORT: String(AUTH_PORT),
            VITE_FIREBASE_FIRESTORE_PORT: String(FIRESTORE_PORT),
        },
    },
});
