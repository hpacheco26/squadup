export function getCaptain(team) {
    if (!team || team.length === 0) return null;
    return team.reduce((cap, player) => (player.rank > cap.rank ? player : cap), team[0]);
}

/**
 * Distribute players across two teams, optionally aware of a target side size
 * (e.g. 5 for 5v5). Keeps the strongest starters on the field; surplus players
 * land at the END of each team's array so callers can treat
 * `team[playersPerTeam:]` as bench.
 *
 * Returns { team1, team2 } where each array preserves "starter first, bench last".
 */
export function balanceTeams(players, playersPerTeam) {
    // Shuffle players with same rank so re-clicks produce different results
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    // Sort players by rank in descending order (higher ranks first)
    const sortedPlayers = shuffled.sort((a, b) => b.rank - a.rank);

    const team1 = [];
    const team2 = [];
    const team1Bench = [];
    const team2Bench = [];

    const cap = Number(playersPerTeam) > 0 ? Number(playersPerTeam) : Infinity;

    sortedPlayers.forEach((player) => {
        // Pick the side with fewer starters; if both full, pick smaller bench.
        const t1Starters = team1.length;
        const t2Starters = team2.length;
        if (t1Starters < cap && t2Starters < cap) {
            (t1Starters <= t2Starters ? team1 : team2).push(player);
        } else if (t1Starters < cap) {
            team1.push(player);
        } else if (t2Starters < cap) {
            team2.push(player);
        } else {
            (team1Bench.length <= team2Bench.length ? team1Bench : team2Bench).push(player);
        }
    });

    return {
        team1: [...team1, ...team1Bench],
        team2: [...team2, ...team2Bench],
    };
}
