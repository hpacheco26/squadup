/**
 * Programmatic seed helpers for the lifecycle e2e suite.
 *
 * Talks directly to the Firebase emulators:
 *  - Auth users are created via the Auth emulator REST API.
 *  - Firestore documents are written via @firebase/rules-unit-testing with
 *    rules disabled so we never have to satisfy production security rules
 *    when arranging fixtures.
 *
 * The application code itself still runs against the emulators with rules
 * enforced — this module is for test setup only.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';

const PROJECT_ID = 'squadup-a3a55';
const HOST = '127.0.0.1';
const AUTH_PORT = 9099;
const FIRESTORE_PORT = 8080;
const AUTH_API_KEY = 'fake-api-key'; // emulator accepts anything

let _env = null;

async function env() {
    if (_env) return _env;
    const rules = readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf8');
    _env = await initializeTestEnvironment({
        projectId: PROJECT_ID,
        firestore: { rules, host: HOST, port: FIRESTORE_PORT },
    });
    return _env;
}

/**
 * Wipe Firestore + Auth emulator state.
 * Auth emulator clear is documented at:
 *   DELETE http://{host}/emulator/v1/projects/{projectId}/accounts
 */
export async function resetEmulators() {
    const e = await env();
    await e.clearFirestore();
    const url = `http://${HOST}:${AUTH_PORT}/emulator/v1/projects/${PROJECT_ID}/accounts`;
    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok && res.status !== 200) {
        throw new Error(`auth emulator clear failed: ${res.status}`);
    }
}

/**
 * Create an Auth user in the Auth emulator. Returns the local UID.
 */
export async function createAuthUser({ email, password, displayName }) {
    const url = `http://${HOST}:${AUTH_PORT}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=${AUTH_API_KEY}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true, displayName }),
    });
    if (!res.ok) {
        throw new Error(`signUp failed (${res.status}): ${await res.text()}`);
    }
    const json = await res.json();
    return json.localId;
}

/** Run a callback with an admin-bypass Firestore handle. */
async function withAdmin(fn) {
    const e = await env();
    return e.withSecurityRulesDisabled(async (ctx) => fn(ctx.firestore()));
}

export async function setAllowedCreators(uids) {
    return withAdmin(async (db) => {
        await db.doc('config/allowedCreators').set({ uids });
    });
}

/**
 * Build a player snapshot used both as a standalone players/{id} doc and as
 * an embedded entry inside groups[].players / games[].playersIn etc.
 */
export function makePlayer({ firstName, lastName, userId = null, rank = 2 }) {
    const slug = `${firstName}.${lastName}`;
    const id = userId ? `${slug}-${userId}` : `${slug}-guest-${Math.random().toString(36).slice(2, 8)}`;
    return {
        id,
        firstName,
        lastName,
        userId,
        rank,
        stats: { wins: 0, draws: 0, losses: 0 },
        groups: [],
    };
}

export async function createPlayerDoc(player) {
    return withAdmin(async (db) => {
        await db.doc(`players/${player.id}`).set(player);
    });
}

export async function createGroup({ name, adminId, players }) {
    const formattedId = `${name.replace(/\s+/g, '').toLowerCase()}-${adminId}`;
    const group = {
        id: formattedId,
        name,
        adminId,
        adminIds: [adminId],
        players,
        treasuryPlayerId: null,
        createdAt: new Date().toISOString(),
    };
    await withAdmin(async (db) => {
        await db.doc(`groups/${formattedId}`).set(group);
    });
    return group;
}

/**
 * Create a game document. Caller controls which roster bucket each player is
 * in so individual tests can express their starting state.
 */
export async function createGame({
    id = `game-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    groupId,
    adminId,
    minPlayers = 4,
    maxPlayers = 10,
    playersPerTeam = 5,
    playersInvited = [],
    playersIn = [],
    playersOut = [],
    team1 = null,
    team2 = null,
    team1Goals = 0,
    team2Goals = 0,
    status = 'open',
    price = 0,
    date = '2026-12-01',
    time = '20:00',
    location = 'Test Field',
} = {}) {
    const game = {
        id, groupId, adminId, minPlayers, maxPlayers, playersPerTeam,
        playersInvited, playersIn, playersOut,
        injured: [],
        team1, team2, team1Goals, team2Goals,
        status, price, date, time, location,
        recurrence: 'none',
        payments: {},
    };
    await withAdmin(async (db) => {
        await db.doc(`games/${id}`).set(game);
    });
    return game;
}

export async function getGame(id) {
    let snap;
    await withAdmin(async (db) => {
        snap = await db.doc(`games/${id}`).get();
    });
    return snap?.exists ? { id: snap.id, ...snap.data() } : null;
}

export async function cleanup() {
    if (_env) {
        await _env.cleanup();
        _env = null;
    }
}
