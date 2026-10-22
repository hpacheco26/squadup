import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { getTestEnv } from './helpers';

let testDb;
vi.mock('../../src/config/firebase', () => ({ get db() { return testDb; } }));

let env;
let GameService;
let SeasonService;
let GroupService;

const players = [
    { id: 'a', userId: 'admin-uid', firstName: 'Alex', rank: 2, stats: { wins: 2, draws: 1, losses: 0 } },
    { id: 'b', userId: 'member-uid', firstName: 'Jo', rank: 1, stats: { wins: 1, draws: 1, losses: 1 } },
];

beforeAll(async () => {
    env = await getTestEnv();
    testDb = env.authenticatedContext('admin-uid').firestore();
    GameService = (await import('../../src/api/gameService')).default;
    SeasonService = (await import('../../src/api/seasonService')).default;
    GroupService = (await import('../../src/api/groupService')).default;
});
afterAll(async () => { if (env) await env.cleanup(); });
beforeEach(async () => {
    await env.clearFirestore();
    await env.withSecurityRulesDisabled(async ctx => {
        const db = ctx.firestore();
        await setDoc(doc(db, 'config/allowedCreators'), { uids: ['admin-uid'] });
        await setDoc(doc(db, 'groups/g1'), {
            id: 'g1', adminId: 'admin-uid', adminIds: ['admin-uid'], name: 'Squad',
            seasonNumber: 0, seasonGamesPlayed: 4, gamesPerSeason: 5, seasonStartedAt: 100,
            players, playerIds: ['a', 'b'], memberUserIds: ['admin-uid', 'member-uid'],
        });
        await setDoc(doc(db, 'games/game1'), {
            groupId: 'g1', status: 'confirmed', team1: [players[0]], team2: [players[1]],
            recurrence: 'weekly', date: '2026-10-16', time: '21:45', price: 10,
        });
    });
});

describe('season completion transactions', () => {
    it('saves a non-final draw without archiving or resetting ranks', async () => {
        await updateDoc(doc(testDb, 'groups/g1'), { seasonGamesPlayed: 0 });
        await GameService.completeGame('g1', 'game1', { team1Goals: 1, team2Goals: 1 }, 'admin-uid');
        const group = (await getDoc(doc(testDb, 'groups/g1'))).data();
        expect(group).toMatchObject({ seasonNumber: 0, seasonGamesPlayed: 1 });
        expect(group.players.map(p => p.rank)).toEqual([2, 1]);
        expect(group.players.every(p => p.stats.draws === 2)).toBe(true);
        expect((await getDoc(doc(testDb, 'groups/g1/seasons/season-0'))).exists()).toBe(false);
    });

    it('saves a final result before archiving and resetting', async () => {
        await GameService.completeGame('g1', 'game1', { team1Goals: 2, team2Goals: 1 }, 'admin-uid');
        const group = (await getDoc(doc(testDb, 'groups/g1'))).data();
        expect(group).toMatchObject({ seasonNumber: 1, seasonGamesPlayed: 0 });
        const archive = (await getDoc(doc(testDb, 'groups/g1/seasons/season-0'))).data();
        expect(archive.standings[0]).toMatchObject({ id: 'a', rank: 3, wins: 3 });
    });

    it('commits one final result, archive, debt and next game under concurrent completion', async () => {
        const score = { team1Goals: 2, team2Goals: 1 };
        const results = await Promise.all([
            GameService.completeGame('g1', 'game1', score, 'admin-uid'),
            GameService.completeGame('g1', 'game1', score, 'admin-uid'),
        ]);
        expect(results.filter(r => r.alreadyCompleted)).toHaveLength(1);
        const group = (await getDoc(doc(testDb, 'groups/g1'))).data();
        const archive = (await getDoc(doc(testDb, 'groups/g1/seasons/season-0'))).data();
        expect(group).toMatchObject({ seasonNumber: 1, seasonGamesPlayed: 0, liveGameId: null });
        expect(group.players.every(p => p.rank === 0 && p.stats.wins === 0)).toBe(true);
        expect(archive.standings[0]).toMatchObject({ id: 'a', rank: 3, wins: 3 });
        expect(archive.gamesPlayed).toBe(5);
        expect((await getDoc(doc(testDb, 'games/game1'))).exists()).toBe(false);
        const games = await getDocs(collection(testDb, 'games'));
        expect(games.size).toBe(1);
        expect(games.docs[0].id).toBe(group.activeGameId);
        expect((await getDocs(collection(testDb, 'gameDebts'))).size).toBe(1);
        await GameService.completeGame('g1', 'game1', score, 'admin-uid');
        expect((await getDocs(collection(testDb, 'games'))).size).toBe(1);
    });

    it('does not delete the fixture or change ranks on a failed result', async () => {
        await expect(GameService.completeGame('g1', 'game1', { team1Goals: -1, team2Goals: 0 }, 'admin-uid')).rejects.toThrow();
        expect((await getDoc(doc(testDb, 'games/game1'))).exists()).toBe(true);
        expect((await getDoc(doc(testDb, 'groups/g1'))).data().seasonGamesPlayed).toBe(4);
        expect((await getDocs(collection(testDb, 'gameDebts'))).empty).toBe(true);
    });

    it('allows manual ending with a planned fixture and preserves it unchanged', async () => {
        const before = (await getDoc(doc(testDb, 'games/game1'))).data();
        await SeasonService.endSeason('g1', 'admin-uid', 0);
        expect((await getDoc(doc(testDb, 'games/game1'))).data()).toEqual(before);
    });

    it('blocks manual ending after the game has started, and cancellation unlocks it', async () => {
        await GameService.startGame('game1', 'admin-uid');
        await expect(SeasonService.endSeason('g1', 'admin-uid', 0)).rejects.toThrow('GAME_IN_PROGRESS');
        await GameService.deleteGame('game1');
        await expect(SeasonService.endSeason('g1', 'admin-uid', 0)).resolves.toMatchObject({ seasonNumber: 1 });
    });

    it('rejects a stale repeated manual-end request', async () => {
        const results = await Promise.allSettled([
            SeasonService.endSeason('g1', 'admin-uid', 0),
            SeasonService.endSeason('g1', 'admin-uid', 0),
        ]);
        expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
        expect((await getDoc(doc(testDb, 'groups/g1'))).data().seasonNumber).toBe(1);
    });

    it('new groups start at Season 1 with a 48-game target', async () => {
        const group = await GroupService.createGroup({
            name: 'New Squad', adminId: 'admin-uid', adminIds: ['admin-uid'], players: [],
        });

        expect(group).toMatchObject({ seasonNumber: 1, gamesPerSeason: 48, seasonGamesPlayed: 0 });
        expect(group.seasonStartedAt).toBeGreaterThan(0);
    });

    it('rejects invalid targets and targets already reached', async () => {
        for (const gamesPerSeason of [null, 4, 201, 5.5]) {
            await expect(GroupService.updateGroup('g1', { gamesPerSeason })).rejects.toThrow('INVALID_SEASON_TARGET');
        }
        await updateDoc(doc(testDb, 'groups/g1'), { seasonGamesPlayed: 5 });
        await expect(GroupService.updateGroup('g1', { gamesPerSeason: 5 })).rejects.toThrow('INVALID_SEASON_TARGET');
    });

    it('serializes concurrent fixture creation', async () => {
        await GameService.deleteGame('game1');
        const game = { groupId: 'g1', status: 'open' };
        const results = await Promise.allSettled([GameService.createGame(game), GameService.createGame(game)]);
        expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
        expect((await getDocs(collection(testDb, 'games'))).size).toBe(1);
    });
});
