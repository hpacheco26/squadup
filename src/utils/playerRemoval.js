// Pure, framework-free helpers for removing a player from every group-scoped
// collection. Used by groupStore.removePlayer; no Firebase imports here so the
// logic stays unit-testable.

const PLAYER_LIST_FIELDS = ['playersInvited', 'playersIn', 'playersOut', 'team1', 'team2', 'injured'];

/**
 * Strip a player (and any guests they added) from a game's attendance lists,
 * teams, and payment map.
 *
 * @param {object} game game document data
 * @param {string} playerId roster id of the player being removed
 * @returns {object|null} the changed fields (whole-array/map replacements,
 *   safe for updateDoc), or null when the player is not referenced by the game
 */
export function stripPlayerFromGame(game, playerId) {
    if (!game || !playerId) return null;

    // Guests added by the removed player leave with them.
    const removedIds = new Set([playerId]);
    for (const field of PLAYER_LIST_FIELDS) {
        const list = game[field];
        if (!Array.isArray(list)) continue;
        for (const entry of list) {
            if (entry?.guest && entry.addedBy === playerId && entry.id) removedIds.add(entry.id);
        }
    }

    const updates = {};
    let changed = false;

    for (const field of PLAYER_LIST_FIELDS) {
        const list = game[field];
        if (!Array.isArray(list)) continue;
        const next = list.filter(entry => !removedIds.has(entry?.id));
        if (next.length !== list.length) {
            updates[field] = next;
            changed = true;
        }
    }

    if (game.payments && typeof game.payments === 'object') {
        const next = Object.fromEntries(
            Object.entries(game.payments).filter(([id]) => !removedIds.has(id))
        );
        if (Object.keys(next).length !== Object.keys(game.payments).length) {
            updates.payments = next;
            changed = true;
        }
    }

    return changed ? updates : null;
}

/**
 * Remove a player's entry from a game debt document. Guest debts are keyed by
 * the adder's id (see buildGameDebt), so removing the member's key also clears
 * any debt carried for their guests.
 *
 * @param {object} debtDoc gameDebts document data
 * @param {string} playerId roster id of the player being removed
 * @returns {{ debts: object, empty: boolean } | null} the remaining debts map
 *   and whether it is now empty, or null when the player has no debt entry
 */
export function stripPlayerFromDebt(debtDoc, playerId) {
    const debts = debtDoc?.debts;
    if (!debts || typeof debts !== 'object' || !(playerId in debts)) return null;
    const rest = { ...debts };
    delete rest[playerId];
    return { debts: rest, empty: Object.keys(rest).length === 0 };
}
