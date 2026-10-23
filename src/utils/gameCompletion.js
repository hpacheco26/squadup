import { nextRank, rolloverSeason, shouldSeasonEnd, withSeasonDefaults } from './seasons';

export function buildGameCompletion(group, game, score, now = Date.now()) {
    const { team1Goals, team2Goals } = score;
    if (![team1Goals, team2Goals].every(n => Number.isInteger(n) && n >= 0)) {
        throw new Error('INVALID_GAME_SCORE');
    }
    const team1 = game.team1 || [];
    const team2 = game.team2 || [];
    const ids = [...team1, ...team2].map(p => p.id);
    if (!team1.length || !team2.length || ids.some(id => !id) || new Set(ids).size !== ids.length) {
        throw new Error('INVALID_GAME_TEAMS');
    }
    const defaults = withSeasonDefaults(group);
    const players = (group.players || []).map(player => {
        const side = team1.some(p => p.id === player.id) ? 1 : team2.some(p => p.id === player.id) ? 2 : 0;
        if (!side) return player;
        const outcome = team1Goals === team2Goals ? 'draw'
            : (team1Goals > team2Goals ? side === 1 : side === 2) ? 'win' : 'loss';
        const stat = { win: 'wins', draw: 'draws', loss: 'losses' }[outcome];
        return {
            ...player,
            rank: nextRank(player.rank, outcome),
            stats: { ...player.stats, [stat]: (player.stats?.[stat] || 0) + 1 },
        };
    });
    const updated = {
        ...group, ...defaults, players,
        seasonStartedAt: defaults.seasonStartedAt ?? now,
        seasonGamesPlayed: defaults.seasonGamesPlayed + 1,
    };
    const ended = shouldSeasonEnd(updated.seasonGamesPlayed, updated.gamesPerSeason);
    const rollover = ended ? rolloverSeason(updated, { now }) : null;
    const groupFields = rollover?.nextGroupFields || {
        ...defaults, players, seasonStartedAt: updated.seasonStartedAt,
        seasonGamesPlayed: updated.seasonGamesPlayed,
    };
    const debt = buildGameDebt(group, game, now);
    return {
        groupFields, archive: rollover?.archive || null,
        debt,
        savings: buildSavingsEntry(group, game),
        nextGame: buildNextGame({ ...group, players: groupFields.players }, game),
    };
}

export function buildGameDebt(group, game, now = Date.now()) {
    const allPlayers = [...(game.team1 || []), ...(game.team2 || []), ...(game.injured || [])];
    const mode = game.priceMode === 'perPlayer' ? 'perPlayer' : 'split';
    const price = Number(game.price) || 0;
    const fee = Number(game.pricePerPlayer) || 0;
    if (!allPlayers.length) return null;
    // split: the game cost is divided among players; perPlayer: everyone pays a
    // fixed fee regardless of headcount and the fund covers the game cost.
    // No exemptions: the treasury pays like everyone else — they collect from
    // themselves into the fund, which keeps the math trivially verifiable.
    if (mode === 'split' && price <= 0) return null;
    if (mode === 'perPlayer' && fee <= 0) return null;
    const perPlayerCost = mode === 'perPlayer' ? fee : price / allPlayers.length;
    const debts = {};
    for (const player of allPlayers) {
        if (game.payments?.[player.id]) continue;
        const targetId = player.guest && player.addedBy ? player.addedBy : player.id;
        const target = allPlayers.find(p => p.id === targetId) || player;
        debts[targetId] = {
            name: `${target.firstName || ''} ${target.lastName?.[0] ? `${target.lastName[0]}.` : ''}`.trim(),
            amount: Math.round(((debts[targetId]?.amount || 0) + perPlayerCost) * 100) / 100,
            paid: false,
        };
    }
    return Object.keys(debts).length ? {
        groupId: group.id, date: game.date || null, time: game.time || null,
        location: game.location || null, price,
        priceMode: mode,
        ...(mode === 'perPlayer' ? { pricePerPlayer: fee } : {}),
        perPlayerCost: Math.round(perPlayerCost * 100) / 100, createdAt: now, debts,
    } : null;
}

/**
 * Compute the fund expense for a per-player-priced game. Cash basis:
 * completion books only the field cost (−cost); every debt payment books its
 * fee (+fee) when it actually happens in GameDebtService.markPlayerPaid. The
 * balance may go negative while payments are outstanding. Returns null for
 * split-priced games or when no cost is set. No history is kept — the balance
 * is the only state.
 */
export function buildSavingsEntry(group, game) {
    if (game?.priceMode !== 'perPlayer') return null;
    const cost = Number(game.price) || 0;
    if (cost <= 0) return null;
    const balance = Number(group?.savingsBalance) || 0;
    const balanceAfter = Math.round((balance - cost) * 100) / 100;
    return { delta: -cost, balanceAfter };
}

export function buildNextGame(group, game) {
    if (!game.recurrence || game.recurrence === 'none') return null;
    if (!['weekly', 'monthly'].includes(game.recurrence)) throw new Error('INVALID_GAME_RECURRENCE');
    const date = new Date(`${game.date}T12:00:00`);
    if (Number.isNaN(date.getTime())) throw new Error('INVALID_GAME_DATE');
    if (game.recurrence === 'weekly') date.setDate(date.getDate() + 7);
    else date.setMonth(date.getMonth() + 1);
    const nextDate = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
    return {
        status: 'open', date: nextDate, time: game.time || null,
        location: game.location || '', maxPlayers: game.maxPlayers ?? 10,
        minPlayers: game.minPlayers ?? 10, playersPerTeam: game.playersPerTeam ?? 5,
        playersInvited: group.players || [], playersIn: [], playersOut: [],
        team1: [], team2: [], subTime: game.subTime ?? 5, subMode: game.subMode || 'auto',
        recurrence: game.recurrence, price: game.price || 0,
        priceMode: game.priceMode || 'split', pricePerPlayer: game.pricePerPlayer || 0,
        payments: {}, groupId: group.id,
    };
}
