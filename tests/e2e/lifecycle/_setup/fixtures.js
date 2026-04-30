/**
 * High-level seed orchestration + login helper used by every lifecycle spec.
 *
 * Each spec calls `seedFresh()` in beforeEach to wipe the emulators and
 * recreate a small deterministic world: one admin user + a group with 6
 * players + (optionally) a pre-existing game. Then `loginAs(page, user)`
 * drives the login form so the app's authStore picks up the session like
 * a real user would.
 */

import {
    resetEmulators,
    createAuthUser,
    setAllowedCreators,
    createPlayerDoc,
    createGroup,
    makePlayer,
} from './seed.js';

export const ADMIN = {
    email: 'admin@e2e.local',
    password: 'Password!1',
    firstName: 'Ada',
    lastName: 'Admin',
};

/**
 * Wipe + reseed a deterministic world.
 * @returns {Promise<{adminUid:string, group:object, players:object[], adminPlayer:object}>}
 */
export async function seedFresh() {
    await resetEmulators();

    const adminUid = await createAuthUser({
        email: ADMIN.email,
        password: ADMIN.password,
        displayName: `${ADMIN.firstName} ${ADMIN.lastName}`,
    });

    await setAllowedCreators([adminUid]);

    const adminPlayer = makePlayer({
        firstName: ADMIN.firstName,
        lastName: ADMIN.lastName,
        userId: adminUid,
        rank: 3,
    });

    // 5 fake teammates with varying ranks so team-balancing has something to do.
    const others = [
        makePlayer({ firstName: 'Bob', lastName: 'Beta', userId: `uid-bob`, rank: 1 }),
        makePlayer({ firstName: 'Cleo', lastName: 'Gamma', userId: `uid-cleo`, rank: 2 }),
        makePlayer({ firstName: 'Dan', lastName: 'Delta', userId: `uid-dan`, rank: 3 }),
        makePlayer({ firstName: 'Eve', lastName: 'Epsilon', userId: `uid-eve`, rank: 4 }),
        makePlayer({ firstName: 'Fin', lastName: 'Phi', userId: `uid-fin`, rank: 2 }),
    ];

    const players = [adminPlayer, ...others];
    for (const p of players) await createPlayerDoc(p);

    const group = await createGroup({
        name: 'Test Squad',
        adminId: adminUid,
        players,
    });

    // Backfill each player's groups[] array so HomePage subscriptions resolve.
    for (const p of players) {
        p.groups = [{ id: group.id, name: group.name }];
        await createPlayerDoc(p);
    }

    return { adminUid, group, players, adminPlayer };
}

/**
 * Drive the login form. The app's authStore listens to onAuthStateChanged so
 * we just submit and wait for the redirect away from /login.
 */
export async function loginAs(page, { email = ADMIN.email, password = ADMIN.password } = {}) {
    await page.goto('/login');
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(password);
    await page.getByRole('button', { name: /^(login|entrar)$/i }).click();
    // After login authStore + ProtectedRoute let us through; HomePage mounts.
    await page.waitForURL((url) => !/\/login$/.test(url.pathname), { timeout: 15_000 });
}
