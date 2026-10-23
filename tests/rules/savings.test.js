import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { getTestEnv, asUser } from './helpers';

let testDb;
vi.mock('../../src/config/firebase', () => ({ get db() { return testDb; } }));

let env;
let GameService;
let SavingsService;
let GameDebtService;

const players = [
    { id: 'a', userId: 'admin-uid', firstName: 'Alex', rank: 0, stats: { wins: 0, draws: 0, losses: 0 } },
    { id: 'b', userId: 'member-uid', firstName: 'Jo', rank: 0, stats: { wins: 0, draws: 0, losses: 0 } },
    { id: 't1', userId: 'treasury-uid', firstName: 'Trez', rank: 0, stats: { wins: 0, draws: 0, losses: 0 } },
];

const asTreasury = () => { testDb = env.authenticatedContext('treasury-uid').firestore(); };
const asAdmin = () => { testDb = env.authenticatedContext('admin-uid').firestore(); };

beforeAll(async () => {
    env = await getTestEnv();
    asAdmin();
    GameService = (await import('../../src/api/gameService')).default;
    SavingsService = (await import('../../src/api/savingsService')).default;
    GameDebtService = (await import('../../src/api/gameDebtService')).default;
});
afterAll(async () => { if (env) await env.cleanup(); });
beforeEach(async () => {
    await env.clearFirestore();
    asAdmin();
    await env.withSecurityRulesDisabled(async ctx => {
        const db = ctx.firestore();
        await setDoc(doc(db, 'groups/g1'), {
            id: 'g1', adminId: 'admin-uid', adminIds: ['admin-uid'], name: 'Squad',
            seasonNumber: 0, seasonGamesPlayed: 0, gamesPerSeason: 48, seasonStartedAt: 100,
            players, playerIds: ['a', 'b', 't1'],
            memberUserIds: ['admin-uid', 'member-uid', 'treasury-uid'],
            treasuryPlayerId: 't1', treasuryUserId: 'treasury-uid',
            savingsBalance: 0,
        });
        await setDoc(doc(db, 'games/game1'), {
            groupId: 'g1', status: 'confirmed', date: '2026-10-22', time: '21:00',
            team1: [players[0]], team2: [players[1]], injured: [players[2]],
            priceMode: 'perPlayer', price: 50, pricePerPlayer: 6,
        });
    });
});

describe('group savings balance', () => {
    it('books the field cost into the fund at game completion (cash basis)', async () => {
        await GameService.completeGame('g1', 'game1', { team1Goals: 2, team2Goals: 1 }, 'admin-uid');
        expect((await getDoc(doc(testDb, 'groups/g1'))).data().savingsBalance).toBe(-50);
    });

    it('moves the balance when a member clears a per-player debt, idempotently', async () => {
        await GameService.completeGame('g1', 'game1', { team1Goals: 2, team2Goals: 1 }, 'admin-uid');
        // member-uid marks their own debt paid
        testDb = env.authenticatedContext('member-uid').firestore();
        await assertSucceeds(GameDebtService.markPlayerPaid('game1', 'b', 'g1'));
        expect((await getDoc(doc(testDb, 'groups/g1'))).data().savingsBalance).toBe(-44); // −50 + 6
        // marking paid again is a no-op for the fund
        await GameDebtService.markPlayerPaid('game1', 'b', 'g1');
        expect((await getDoc(doc(testDb, 'groups/g1'))).data().savingsBalance).toBe(-44);
    });

    it('treasury can spend/adjust the balance', async () => {
        asTreasury();
        await assertSucceeds(SavingsService.addEntry('g1', { type: 'spend', delta: -20 }));
        expect((await getDoc(doc(testDb, 'groups/g1'))).data().savingsBalance).toBe(-20);
    });

    it('treasury cannot touch other group fields', async () => {
        asTreasury();
        await assertFails(updateDoc(doc(testDb, 'groups/g1'), { name: 'Hacked' }));
        await assertFails(updateDoc(doc(testDb, 'groups/g1'), {
            savingsBalance: 10, name: 'Hacked',
        }));
    });

    it('members can update only the savings balance', async () => {
        const memberDb = asUser(env, 'member-uid');
        await assertSucceeds(updateDoc(doc(memberDb, 'groups/g1'), { savingsBalance: 5 }));
        await assertFails(updateDoc(doc(memberDb, 'groups/g1'), { name: 'Hacked' }));
        await assertFails(updateDoc(doc(memberDb, 'groups/g1'), { savingsBalance: 5, name: 'Hacked' }));
    });

    it('non-members cannot move the balance', async () => {
        const strangerDb = asUser(env, 'stranger-uid');
        await assertFails(updateDoc(doc(strangerDb, 'groups/g1'), { savingsBalance: 1000 }));
    });
});
