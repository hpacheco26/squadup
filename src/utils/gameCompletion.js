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
    return {
        groupFields, archive: rollover?.archive || null,
        debt: buildGameDebt(group, game, now),
        nextGame: buildNextGame({ ...group, players: groupFields.players }, game),
    };
}

export function buildGameDebt(group, game, now = Date.now()) {
    const allPlayers = [...(game.team1 || []), ...(game.team2 || []), ...(game.injured || [])];
    const price = Number(game.price) || 0;
    if (price <= 0 || !allPlayers.length) return null;
    const admin = (group.players || []).find(p => group.adminIds?.includes(p.userId) || p.userId === group.adminId);
    const treasuryId = group.treasuryPlayerId || admin?.id || null;
    const perPlayerCost = price / allPlayers.length;
    const debts = {};
    for (const player of allPlayers) {
        if (game.payments?.[player.id] || player.id === treasuryId || (player.guest && player.addedBy === treasuryId)) continue;
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
        perPlayerCost: Math.round(perPlayerCost * 100) / 100, createdAt: now, debts,
    } : null;
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
        recurrence: game.recurrence, price: game.price || 0, payments: {}, groupId: group.id,
    };
}
