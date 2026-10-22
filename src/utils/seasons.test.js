import { describe, it, expect } from 'vitest';
import {
    DEFAULT_GAMES_PER_SEASON,
    MIN_GAMES_PER_SEASON,
    MAX_GAMES_PER_SEASON,
    LAUNCH_SEASON_NUMBER,
    NEW_GROUP_SEASON_NUMBER,
    seasonDocId,
    normalizeGamesPerSeason,
    shouldSeasonEnd,
    nextRank,
    resetPlayersForNewSeason,
    buildStandingsSnapshot,
    buildSeasonRecap,
    rolloverSeason,
    withSeasonDefaults,
    hasSeasonFields,
    withCurrentPlayerRanks,
} from './seasons';

const makePlayers = () => [
    { id: 'a', firstName: 'Alex', lastName: 'Reed', userId: 'ua', rank: 2, stats: { wins: 10, draws: 2, losses: 4 } },
    { id: 'b', firstName: 'Jo', lastName: 'Marsh', userId: 'ub', rank: 4, stats: { wins: 12, draws: 2, losses: 2 } },
    { id: 'c', firstName: 'Sam', lastName: 'Tan', userId: null, rank: 2, stats: { wins: 10, draws: 2, losses: 6 } },
];

describe('planned fixture ranks', () => {
    it('uses reset roster ranks without changing attendance or guests', () => {
        const attendance = [{ id: 'a', rank: 4 }, { id: 'guest', rank: 2, guest: true }];
        expect(withCurrentPlayerRanks(attendance, [{ id: 'a', rank: 0 }])).toEqual([
            { id: 'a', rank: 0 }, { id: 'guest', rank: 2, guest: true },
        ]);
        expect(attendance[0].rank).toBe(4);
    });
});

describe('seasonDocId', () => {
    it('builds a stable id from the season number', () => {
        expect(seasonDocId(0)).toBe('season-0');
        expect(seasonDocId(3)).toBe('season-3');
    });
    it('falls back to 0 for bad input', () => {
        expect(seasonDocId(undefined)).toBe('season-0');
        expect(seasonDocId('x')).toBe('season-0');
    });
});

describe('normalizeGamesPerSeason', () => {
    it('keeps a valid value', () => {
        expect(normalizeGamesPerSeason(48)).toBe(48);
    });
    it('clamps to the supported range', () => {
        expect(normalizeGamesPerSeason(1)).toBe(MIN_GAMES_PER_SEASON);
        expect(normalizeGamesPerSeason(9999)).toBe(MAX_GAMES_PER_SEASON);
    });
    it('rounds and defaults bad input', () => {
        expect(normalizeGamesPerSeason(20.6)).toBe(21);
        expect(normalizeGamesPerSeason('abc')).toBe(DEFAULT_GAMES_PER_SEASON);
        expect(normalizeGamesPerSeason(undefined)).toBe(DEFAULT_GAMES_PER_SEASON);
        expect(normalizeGamesPerSeason(null)).toBe(DEFAULT_GAMES_PER_SEASON);
        expect(normalizeGamesPerSeason(0)).toBe(DEFAULT_GAMES_PER_SEASON);
    });
});

describe('shouldSeasonEnd', () => {
    it('ends when games played reaches the target', () => {
        expect(shouldSeasonEnd(48, 48)).toBe(true);
        expect(shouldSeasonEnd(49, 48)).toBe(true);
    });
    it('does not end below the target', () => {
        expect(shouldSeasonEnd(47, 48)).toBe(false);
        expect(shouldSeasonEnd(0, 48)).toBe(false);
    });
    it('is defensive against bad input', () => {
        expect(shouldSeasonEnd(-1, 48)).toBe(false);
        expect(shouldSeasonEnd(10, 0)).toBe(false);
        expect(shouldSeasonEnd(NaN, 48)).toBe(false);
        expect(shouldSeasonEnd(10, NaN)).toBe(false);
    });
});

describe('nextRank', () => {
    it('increments a win capped at 4', () => {
        expect(nextRank(2, 'win')).toBe(3);
        expect(nextRank(4, 'win')).toBe(4);
    });
    it('decrements a loss floored at 0', () => {
        expect(nextRank(2, 'loss')).toBe(1);
        expect(nextRank(0, 'loss')).toBe(0);
    });
    it('leaves a draw unchanged', () => {
        expect(nextRank(3, 'draw')).toBe(3);
    });
    it('treats missing rank as 0', () => {
        expect(nextRank(undefined, 'win')).toBe(1);
        expect(nextRank(undefined, 'loss')).toBe(0);
    });
});

describe('resetPlayersForNewSeason', () => {
    it('zeroes rank and W/D/L but preserves identity fields', () => {
        const reset = resetPlayersForNewSeason(makePlayers());
        reset.forEach((p) => {
            expect(p.rank).toBe(0);
            expect(p.stats).toEqual({ wins: 0, draws: 0, losses: 0 });
        });
        expect(reset[0].id).toBe('a');
        expect(reset[0].firstName).toBe('Alex');
        expect(reset[0].userId).toBe('ua');
    });
    it('does not mutate the input', () => {
        const players = makePlayers();
        resetPlayersForNewSeason(players);
        expect(players[0].rank).toBe(2);
        expect(players[0].stats.wins).toBe(10);
    });
    it('returns [] for non-arrays', () => {
        expect(resetPlayersForNewSeason(undefined)).toEqual([]);
        expect(resetPlayersForNewSeason(null)).toEqual([]);
    });
});

describe('buildStandingsSnapshot', () => {
    it('sorts by rank desc, then wins desc, then losses asc', () => {
        const snap = buildStandingsSnapshot(makePlayers());
        expect(snap.map((s) => s.id)).toEqual(['b', 'a', 'c']); // b rank4; a & c rank2 but a fewer losses
    });
    it('captures name and W/D/L and defaults missing stats', () => {
        const snap = buildStandingsSnapshot([{ id: 'x', firstName: 'X' }]);
        expect(snap[0]).toEqual({ id: 'x', userId: null, firstName: 'X', lastName: '', rank: 0, wins: 0, draws: 0, losses: 0, position: 1 });
    });
    it('returns [] for non-arrays', () => {
        expect(buildStandingsSnapshot(null)).toEqual([]);
    });
    it('gives tied players the same position and preserves auth identity', () => {
        const players = makePlayers();
        players[2].stats.losses = 4;
        const snapshot = buildStandingsSnapshot(players);
        expect(snapshot.map(p => p.position)).toEqual([1, 2, 2]);
        expect(snapshot.find(p => p.id === 'a').userId).toBe('ua');
    });
});

describe('buildSeasonRecap', () => {
    const season = {
        number: 2,
        gamesPlayed: 48,
        endReason: 'target',
        standings: buildStandingsSnapshot(makePlayers()),
    };
    it('reports position, record, and champion for a player', () => {
        const recap = buildSeasonRecap(season, 'a');
        expect(recap.position).toBe(2);
        expect(recap.totalPlayers).toBe(3);
        expect(recap.rank).toBe(2);
        expect(recap.wins).toBe(10);
        expect(recap.seasonNumber).toBe(2);
        expect(recap.champion.id).toBe('b');
        expect(recap.champion.rank).toBe(4);
    });
    it('marks the champion as position 1', () => {
        expect(buildSeasonRecap(season, 'b').position).toBe(1);
    });
    it('returns null when the player is not in the standings', () => {
        expect(buildSeasonRecap(season, 'zzz')).toBeNull();
    });
    it('returns null for malformed input', () => {
        expect(buildSeasonRecap(null, 'a')).toBeNull();
        expect(buildSeasonRecap({ number: 1 }, 'a')).toBeNull();
    });
    it('does not declare a champion for an empty season', () => {
        const recap = buildSeasonRecap({ number: 1, gamesPlayed: 0, standings: buildStandingsSnapshot([{ id: 'a' }]) }, 'a');
        expect(recap.champion).toBeNull();
        expect(recap.champions).toEqual([]);
    });
    it('reports shared champions for a tied leaderboard', () => {
        const standings = buildStandingsSnapshot([
            { id: 'a', rank: 2, stats: { wins: 3 } },
            { id: 'b', rank: 2, stats: { wins: 3 } },
        ]);
        expect(buildSeasonRecap({ standings }, 'b')).toMatchObject({ position: 1, sharedChampion: true });
    });
});

describe('rolloverSeason', () => {
    const group = {
        seasonNumber: 0,
        seasonGamesPlayed: 48,
        gamesPerSeason: 48,
        players: makePlayers(),
    };
    it('archives the current season with sorted standings', () => {
        const { archive } = rolloverSeason(group, { now: 1000 });
        expect(archive.number).toBe(0);
        expect(archive.gamesPlayed).toBe(48);
        expect(archive.endReason).toBe('target');
        expect(archive.endedAt).toBe(1000);
        expect(archive.standings.map((s) => s.id)).toEqual(['b', 'a', 'c']);
    });
    it('produces reset next-season group fields incrementing the number', () => {
        const { nextGroupFields } = rolloverSeason(group, { now: 1000 });
        expect(nextGroupFields.seasonNumber).toBe(1);
        expect(nextGroupFields.seasonGamesPlayed).toBe(0);
        expect(nextGroupFields.seasonStartedAt).toBe(1000);
        nextGroupFields.players.forEach((p) => {
            expect(p.rank).toBe(0);
            expect(p.stats).toEqual({ wins: 0, draws: 0, losses: 0 });
        });
    });
    it('records manual end reason and actor', () => {
        const { archive } = rolloverSeason(group, { endReason: 'manual', endedBy: 'ua' });
        expect(archive.endReason).toBe('manual');
        expect(archive.endedBy).toBe('ua');
    });
    it('does not mutate the input group', () => {
        rolloverSeason(group, { now: 1 });
        expect(group.players[0].rank).toBe(2);
        expect(group.seasonNumber).toBe(0);
    });
});

describe('withSeasonDefaults / hasSeasonFields', () => {
    it('defaults an existing (unmigrated) group to Season 0', () => {
        const d = withSeasonDefaults({ players: [] });
        expect(d.seasonNumber).toBe(LAUNCH_SEASON_NUMBER);
        expect(d.gamesPerSeason).toBe(DEFAULT_GAMES_PER_SEASON);
        expect(d.seasonGamesPlayed).toBe(0);
    });
    it('defaults a new group to Season 1', () => {
        expect(withSeasonDefaults({}, { isNewGroup: true }).seasonNumber).toBe(NEW_GROUP_SEASON_NUMBER);
    });
    it('keeps existing season fields', () => {
        const d = withSeasonDefaults({ seasonNumber: 3, gamesPerSeason: 20, seasonGamesPlayed: 5 });
        expect(d).toMatchObject({ seasonNumber: 3, gamesPerSeason: 20, seasonGamesPlayed: 5 });
    });
    it('detects presence of season fields', () => {
        expect(hasSeasonFields({ seasonNumber: 0 })).toBe(true);
        expect(hasSeasonFields({})).toBe(false);
        expect(hasSeasonFields(null)).toBe(false);
    });
});
