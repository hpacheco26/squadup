export function getGroupRank(group, userId) {
    if (!group || !group.players) return null; // Ensure group data exists

    const player = group.players.find(p => p.userId === userId);
    return player ? player.rank : null; // Return rank if found, otherwise null
}
