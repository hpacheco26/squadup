// Pure, framework-free helpers for game attendance changes.
// No Firebase imports here so the logic stays unit-testable.

const LINEUP_FIELDS = ['team1', 'team2', 'injured'];

/**
 * Remove a player from a game's lineup (teams + injured list).
 *
 * Needed when a player marks themselves OUT after teams were drawn: attendance
 * lists move them to playersOut, but the completion math (ranks, stats) and the
 * debt split are computed from team1/team2/injured — leaving them in a team
 * would charge and rate someone who is no longer playing.
 *
 * @param {object} game game document data
 * @param {string} playerId roster id of the player leaving the lineup
 * @returns {object|null} the changed lineup fields (whole-array replacements,
 *   safe for updateDoc), or null when the player is not in the lineup
 */
export function removeFromLineup(game, playerId) {
    if (!game || !playerId) return null;
    const updates = {};
    for (const field of LINEUP_FIELDS) {
        const list = game[field];
        if (!Array.isArray(list)) continue;
        const next = list.filter(entry => entry?.id !== playerId);
        if (next.length !== list.length) updates[field] = next;
    }
    return Object.keys(updates).length ? updates : null;
}
