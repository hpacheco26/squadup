import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PORT) || 4173;

export default defineConfig({
    testDir: './tests/e2e',
    timeout: 30_000,
    expect: { timeout: 5_000 },
    fullyParallel: true,
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
    use: {
        baseURL: `http://127.0.0.1:${PORT}`,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    projects: [
        { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
        { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
        { name: 'mobile-safari', use: { ...devices['iPhone 14'] } },
    ],
    webServer: {
        // Build first so PWA assets are produced; preview serves the built app.
        command: 'npm run build && npm run preview -- --port ' + PORT + ' --strictPort',
        url: `http://127.0.0.1:${PORT}`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
});
