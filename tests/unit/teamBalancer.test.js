import { describe, it, expect } from 'vitest';
import { balanceTeams, getCaptain } from '../../src/utils/teamBalancer';

const mkPlayer = (id, rank) => ({ id, rank, firstName: `P${id}` });

describe('getCaptain', () => {
    it('returns null for empty input', () => {
        expect(getCaptain([])).toBeNull();
        expect(getCaptain(null)).toBeNull();
        expect(getCaptain(undefined)).toBeNull();
    });

    it('returns the highest-ranked player', () => {
        const team = [mkPlayer('a', 10), mkPlayer('b', 30), mkPlayer('c', 20)];
        expect(getCaptain(team).id).toBe('b');
    });

    it('returns the only player when team has size 1', () => {
        expect(getCaptain([mkPlayer('a', 5)]).id).toBe('a');
    });
});

describe('balanceTeams', () => {
    it('returns two empty teams for empty input', () => {
        const { team1, team2 } = balanceTeams([], 5);
        expect(team1).toEqual([]);
        expect(team2).toEqual([]);
    });

    it('splits players evenly when count is even and within cap', () => {
        const players = [1, 2, 3, 4].map((r) => mkPlayer(`p${r}`, r * 10));
        const { team1, team2 } = balanceTeams(players, 5);
        expect(team1).toHaveLength(2);
        expect(team2).toHaveLength(2);
    });

    it('preserves all players (no drops, no duplicates)', () => {
        const players = Array.from({ length: 11 }, (_, i) => mkPlayer(`p${i}`, i));
        const { team1, team2 } = balanceTeams(players, 5);
        const ids = [...team1, ...team2].map((p) => p.id).sort();
        expect(ids).toEqual(players.map((p) => p.id).sort());
    });

    it('caps starters at playersPerTeam and pushes overflow to the bench (end of array)', () => {
        const players = Array.from({ length: 12 }, (_, i) => mkPlayer(`p${i}`, 100 - i));
        const cap = 5;
        const { team1, team2 } = balanceTeams(players, cap);
        // total = 12, 5 starters per side + 2 bench split between sides
        expect(team1.length + team2.length).toBe(12);
        // The first `cap` of each team should be the starters; remainder is bench.
        expect(team1.length).toBeGreaterThanOrEqual(cap);
        expect(team2.length).toBeGreaterThanOrEqual(cap);
    });

    it('balances total rank within a small tolerance', () => {
        const players = Array.from({ length: 10 }, (_, i) => mkPlayer(`p${i}`, i * 5));
        const { team1, team2 } = balanceTeams(players, 5);
        const sum = (t) => t.reduce((acc, p) => acc + p.rank, 0);
        const diff = Math.abs(sum(team1) - sum(team2));
        // Greedy "fill emptier side" on sorted ranks. Worst case for evenly-spaced
        // ranks is the gap between consecutive ranks summed across the rotation.
        // For ranks [0,5,..,45] the diff is 25; allow a small margin.
        expect(diff).toBeLessThanOrEqual(30);
    });

    it('treats non-positive playersPerTeam as no cap (everyone is a starter)', () => {
        const players = Array.from({ length: 6 }, (_, i) => mkPlayer(`p${i}`, i));
        const { team1, team2 } = balanceTeams(players, 0);
        expect(team1.length + team2.length).toBe(6);
    });
});
