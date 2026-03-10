export function balanceTeams(players) {
    // Shuffle players with same rank so re-clicks produce different results
    const shuffled = [...players].sort(() => Math.random() - 0.5);

    // Sort players by rank in descending order (higher ranks first)
    const sortedPlayers = shuffled.sort((a, b) => b.rank - a.rank);

    // Initialize empty teams
    const team1 = [];
    const team2 = [];

    // Distribute players alternately to keep balance
    sortedPlayers.forEach((player, index) => {
        if (team1.length <= team2.length) {
            team1.push(player);
        } else {
            team2.push(player);
        }
    });

    return { team1, team2 };
}
