/**
 * Playwright globalSetup: runs once before any lifecycle spec.
 *
 * Verifies the Firebase emulators are reachable. We do NOT seed test data
 * here because each spec calls `seedFresh()` in beforeEach to start from a
 * deterministic, isolated state.
 */

const HOST = '127.0.0.1';

async function ping(url, label) {
    try {
        const res = await fetch(url);
        if (!res.ok && res.status !== 200 && res.status !== 404) {
            throw new Error(`unexpected ${res.status}`);
        }
    } catch (err) {
        throw new Error(
            `[lifecycle global-setup] ${label} emulator unreachable at ${url}.\n` +
            `Run via: npm run test:e2e:lifecycle (which wraps Playwright in firebase emulators:exec).\n` +
            `Underlying error: ${err.message}`,
        );
    }
}

export default async function globalSetup() {
    await ping(`http://${HOST}:9099/`, 'auth');
    await ping(`http://${HOST}:8080/`, 'firestore');
}
