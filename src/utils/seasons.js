// Pure, framework-free helpers for group seasons.
// These contain the season logic so it can be unit-tested in isolation and
// reused by the store / service layers. No Firebase or React imports here.

/** Default number of completed games in a season (admin-configurable). */
export const DEFAULT_GAMES_PER_SEASON = 48;

/** Allowed range for an admin-configured season length. */
export const MIN_GAMES_PER_SEASON = 5;
export const MAX_GAMES_PER_SEASON = 200;

/** Existing groups migrate to Season 0; brand-new groups start at Season 1. */
export const LAUNCH_SEASON_NUMBER = 0;
export const NEW_GROUP_SEASON_NUMBER = 1;

/** Stable document id for a season archive, e.g. `season-0`. */
export function seasonDocId(number) {
    return `season-${Number(number) || 0}`;
}

/**
 * Clamp an admin-entered season length to the supported range.
 * Returns the default for non-finite / non-positive input.
 */
export function normalizeGamesPerSeason(value) {
    if (value == null || value === '' || Number(value) <= 0) return DEFAULT_GAMES_PER_SEASON;
    const n = Math.round(Number(value));
    if (!Number.isFinite(n)) return DEFAULT_GAMES_PER_SEASON;
    return Math.min(MAX_GAMES_PER_SEASON, Math.max(MIN_GAMES_PER_SEASON, n));
}

/**
 * Whether the season has reached its target number of completed games.
 * Defensive against bad input (returns false rather than ending a season).
 */
export function shouldSeasonEnd(gamesPlayed, gamesPerSeason) {
    const played = Number(gamesPlayed);
    const target = Number(gamesPerSeason);
    if (!Number.isFinite(played) || played < 0) return false;
    if (!Number.isFinite(target) || target <= 0) return false;
    return played >= target;
}

/**
 * The next rank after a game outcome. Preserves today's 0-4 tier rules:
 * win +1 (max 4), loss -1 (min 0), draw unchanged.
 * @param {number} rank
 * @param {'win'|'loss'|'draw'} outcome
 */
export function nextRank(rank, outcome) {
    const r = Number(rank) || 0;
    if (outcome === 'win') return Math.min(r + 1, 4);
    if (outcome === 'loss') return Math.max(r - 1, 0);
    return r;
}

/** Zero every player's rank and W/D/L, preserving all other player fields. */
export function resetPlayersForNewSeason(players) {
    if (!Array.isArray(players)) return [];
    return players.map((p) => ({
        ...p,
        rank: 0,
        stats: { ...p.stats, wins: 0, draws: 0, losses: 0 },
    }));
}

/**
 * Build a read-only final standings snapshot from a group's roster, sorted
 * like the leaderboard (rank desc, then wins desc, then losses asc).
 * Preserves each player's display name at the time of archiving.
 */
export function buildStandingsSnapshot(players) {
    if (!Array.isArray(players)) return [];
    return players
        .map((p) => ({
            id: p.id,
            userId: p.userId || null,
            firstName: p.firstName || '',
            lastName: p.lastName || '',
            rank: p.rank || 0,
            wins: p.stats?.wins || 0,
            draws: p.stats?.draws || 0,
            losses: p.stats?.losses || 0,
        }))
        .sort((a, b) => b.rank - a.rank || b.wins - a.wins || a.losses - b.losses)
        .map((player, _index, standings) => ({
            ...player,
            position: standings.findIndex(p => p.rank === player.rank && p.wins === player.wins && p.losses === player.losses) + 1,
        }));
}

/**
 * Per-player recap for the season-end screen, built from an archived season.
 * @param {{ number:number, gamesPlayed?:number, endReason?:string, standings:Array }} season
 * @param {string} playerId
 * @returns {object|null} recap, or null when the player is not in the standings
 */
export function buildSeasonRecap(season, playerId) {
    if (!season || !Array.isArray(season.standings)) return null;
    const { standings } = season;
    const index = standings.findIndex((s) => s.id === playerId);
    if (index === -1) return null;
    const me = standings[index];
    const positionOf = (player) => player.position || standings.findIndex(p =>
        p.rank === player.rank && p.wins === player.wins && p.losses === player.losses) + 1;
    const champions = standings.some(p => p.wins + p.draws + p.losses > 0)
        ? standings.filter(p => positionOf(p) === 1)
        : [];
    const champion = champions[0] || null;
    return {
        seasonNumber: season.number ?? 0,
        endReason: season.endReason || 'target',
        gamesPlayed: season.gamesPlayed ?? null,
        totalPlayers: standings.length,
        position: positionOf(me),
        rank: me.rank || 0,
        wins: me.wins || 0,
        draws: me.draws || 0,
        losses: me.losses || 0,
        champions,
        sharedChampion: champions.length > 1,
        champion: champion
            ? {
                id: champion.id,
                firstName: champion.firstName || '',
                lastName: champion.lastName || '',
                rank: champion.rank || 0,
            }
            : null,
    };
}

/**
 * Compute the archive document and the next-season group fields for a rollover.
 * Pure: callers persist the results. Used by both automatic (target reached)
 * completion and the admin "End season now" action.
 *
 * @param {object} group current group (needs seasonNumber, seasonGamesPlayed,
 *   gamesPerSeason, players)
 * @param {{ endReason?:'target'|'manual', endedBy?:string|null, now?:number }} opts
 * @returns {{ archive: object, nextGroupFields: object }}
 */
export function rolloverSeason(group, opts = {}) {
    const { endReason = 'target', endedBy = null, now = Date.now() } = opts;
    const number = group?.seasonNumber ?? LAUNCH_SEASON_NUMBER;
    const gamesPerSeason = normalizeGamesPerSeason(group?.gamesPerSeason);
    const players = Array.isArray(group?.players) ? group.players : [];

    const archive = {
        number,
        gamesPlayed: group?.seasonGamesPlayed ?? 0,
        gamesPerSeason,
        endReason,
        endedBy,
        endedAt: now,
        standings: buildStandingsSnapshot(players),
    };

    const nextGroupFields = {
        seasonNumber: number + 1,
        seasonGamesPlayed: 0,
        seasonStartedAt: now,
        gamesPerSeason,
        players: resetPlayersForNewSeason(players),
    };

    return { archive, nextGroupFields };
}

/**
 * Season fields a group should have, filling defaults for groups that predate
 * the feature (defensive init so completion works even before/if migration runs).
 * Existing groups default to Season 0; new groups to Season 1.
 */
export function withSeasonDefaults(group, { isNewGroup = false } = {}) {
    return {
        seasonNumber:
            group?.seasonNumber ??
            (isNewGroup ? NEW_GROUP_SEASON_NUMBER : LAUNCH_SEASON_NUMBER),
        gamesPerSeason: normalizeGamesPerSeason(group?.gamesPerSeason),
        seasonGamesPlayed: group?.seasonGamesPlayed ?? 0,
        seasonStartedAt: group?.seasonStartedAt ?? null,
    };
}

/** True when a group already carries season fields. */
export function hasSeasonFields(group) {
    return group != null && typeof group.seasonNumber === 'number';
}

/** Planned fixtures retain attendance, but use the current roster's competitive ranks. */
export function withCurrentPlayerRanks(players = [], roster = []) {
    const ranks = new Map((roster || []).map(player => [player.id, player.rank ?? 0]));
    return (players || []).map(player => ranks.has(player.id) && !player.guest
        ? { ...player, rank: ranks.get(player.id) }
        : player);
}
