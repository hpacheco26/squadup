import { describe, expect, it } from 'vitest';
import { buildGameCompletion, buildNextGame } from './gameCompletion';

const makeGroup = () => ({
    id: 'g1', adminId: 'admin', seasonNumber: 0, seasonGamesPlayed: 0, gamesPerSeason: 5,
    players: [
        { id: 'a', userId: 'admin', rank: 2, stats: { wins: 1, draws: 0, losses: 0, other: 9 } },
        { id: 'b', rank: 2 },
    ],
});
const makeGame = () => ({
    groupId: 'g1', team1: [{ id: 'a' }], team2: [{ id: 'b' }],
    date: '2026-10-16', time: '21:45', recurrence: 'weekly', price: 10,
    playersPerTeam: 4, subMode: 'manual',
});

describe('game completion', () => {
    it('applies only participating players and counts a completed game once', () => {
        const group = makeGroup();
        group.players.push({ id: 'absent', rank: 4 });
        const result = buildGameCompletion(group, makeGame(), { team1Goals: 2, team2Goals: 1 }, 1000);
        expect(result.groupFields.seasonGamesPlayed).toBe(1);
        expect(result.groupFields.players[0]).toMatchObject({ rank: 3, stats: { wins: 2, other: 9 } });
        expect(result.groupFields.players[1]).toMatchObject({ rank: 1, stats: { losses: 1 } });
        expect(result.groupFields.players[2]).toEqual(group.players[2]);
        expect(group.players[0].rank).toBe(2);
    });
    it('counts draws without moving ranks', () => {
        const result = buildGameCompletion(makeGroup(), makeGame(), { team1Goals: 1, team2Goals: 1 });
        expect(result.groupFields.players.map(p => p.rank)).toEqual([2, 2]);
        expect(result.groupFields.players.every(p => p.stats.draws === 1)).toBe(true);
        expect(result.groupFields.seasonGamesPlayed).toBe(1);
    });
    it('archives final-game results before resetting, preserving unrelated stats', () => {
        const group = { ...makeGroup(), seasonGamesPlayed: 4 };
        const result = buildGameCompletion(group, makeGame(), { team1Goals: 2, team2Goals: 1 }, 1000);
        expect(result.archive).toMatchObject({ number: 0, gamesPlayed: 5 });
        expect(result.archive.standings[0]).toMatchObject({ id: 'a', rank: 3, wins: 2 });
        expect(result.groupFields).toMatchObject({ seasonNumber: 1, seasonGamesPlayed: 0, seasonStartedAt: 1000 });
        expect(result.groupFields.players[0]).toMatchObject({ rank: 0, stats: { wins: 0, draws: 0, losses: 0, other: 9 } });
    });
    it('keeps payment calculations and recurrence settings in the completion payload', () => {
        const result = buildGameCompletion(makeGroup(), makeGame(), { team1Goals: 2, team2Goals: 1 });
        expect(result.debt.debts).toEqual({
            a: { name: '', amount: 5, paid: false },
            b: { name: '', amount: 5, paid: false },
        });
        expect(result.nextGame).toMatchObject({ date: '2026-10-23', time: '21:45', playersPerTeam: 4, subMode: 'manual', payments: {} });
    });
    it('rejects invalid scores and team duplicates rather than saving partial results', () => {
        expect(() => buildGameCompletion(makeGroup(), makeGame(), { team1Goals: -1, team2Goals: 0 })).toThrow('INVALID_GAME_SCORE');
        expect(() => buildGameCompletion(makeGroup(), { ...makeGame(), team2: [{ id: 'a' }] }, { team1Goals: 1, team2Goals: 0 })).toThrow('INVALID_GAME_TEAMS');
    });
    it('does not create a recurring fixture when disabled', () => {
        expect(buildNextGame(makeGroup(), { ...makeGame(), recurrence: 'none' })).toBeNull();
    });
});

describe('per-player pricing and savings', () => {
    const perPlayerGame = () => ({
        ...makeGame(), priceMode: 'perPlayer', price: 50, pricePerPlayer: 6,
        injured: [{ id: 'c', firstName: 'Cy' }],
    });

    it('charges the fixed fee to everyone who played, treasury included', () => {
        const group = makeGroup();
        group.players.push({ id: 'c', rank: 0 });
        group.treasuryPlayerId = 'a';
        const result = buildGameCompletion(group, perPlayerGame(), { team1Goals: 2, team2Goals: 1 });
        expect(result.debt.priceMode).toBe('perPlayer');
        expect(result.debt.perPlayerCost).toBe(6);
        expect(result.debt.debts).toEqual({
            a: { name: '', amount: 6, paid: false },
            b: { name: '', amount: 6, paid: false },
            c: { name: 'Cy', amount: 6, paid: false },
        });
    });

    it('books the field cost as a fund expense at completion (cash basis)', () => {
        const group = { ...makeGroup(), savingsBalance: 20 };
        group.players.push({ id: 'c', rank: 0 });
        const result = buildGameCompletion(group, perPlayerGame(), { team1Goals: 2, team2Goals: 1 }, 1000);
        // income is booked later, per debt payment — completion only spends
        expect(result.savings).toMatchObject({ delta: -50, balanceAfter: -30 });
    });

    it('books nothing for split-priced games, and charges the treasury like anyone else', () => {
        const splitResult = buildGameCompletion(makeGroup(), makeGame(), { team1Goals: 2, team2Goals: 1 });
        expect(splitResult.savings).toBeNull();
        // Only the treasury and their guest take part — they owe both fees, and
        // the fund still books the field cost.
        const group = makeGroup();
        group.treasuryPlayerId = 'a';
        const treasuryOnly = buildGameCompletion(
            group,
            { ...perPlayerGame(), injured: [], team2: [{ id: 'g1', guest: true, addedBy: 'a', firstName: 'G' }] },
            { team1Goals: 1, team2Goals: 0 },
        );
        expect(treasuryOnly.debt.debts).toEqual({ a: { name: '', amount: 12, paid: false } });
        expect(treasuryOnly.savings).toMatchObject({ delta: -50, balanceAfter: -50 });
    });

    it('books no expense when the game cost is zero', () => {
        const result = buildGameCompletion(
            makeGroup(), { ...perPlayerGame(), price: 0 }, { team1Goals: 2, team2Goals: 1 },
        );
        expect(result.debt.debts).toEqual({
            a: { name: '', amount: 6, paid: false },
            b: { name: '', amount: 6, paid: false },
            c: { name: 'Cy', amount: 6, paid: false },
        });
        expect(result.savings).toBeNull();
    });

    it('carries the pricing mode and fee into the next recurring fixture', () => {
        const result = buildGameCompletion(makeGroup(), perPlayerGame(), { team1Goals: 2, team2Goals: 1 });
        expect(result.nextGame).toMatchObject({ priceMode: 'perPlayer', pricePerPlayer: 6, price: 50 });
    });
});
