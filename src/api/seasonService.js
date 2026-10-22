import { db } from '../config/firebase';
import {
    collection, doc, getDoc, getDocs, onSnapshot, query, orderBy, runTransaction,
} from 'firebase/firestore';
import { seasonDocId, rolloverSeason, withSeasonDefaults } from '../utils/seasons';

const seasonsCol = (groupId) => collection(db, 'groups', groupId, 'seasons');

/**
 * Read/write access to a group's archived seasons.
 *
 * Archived seasons live in `groups/{groupId}/seasons/{seasonId}` and are
 * immutable once written. A rollover uses a transaction so concurrent admins
 * cannot end the same season twice or apply a stale standings snapshot.
 */
const SeasonService = {
    getSeasons: async (groupId) => {
        const snap = await getDocs(query(seasonsCol(groupId), orderBy('number', 'desc')));
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },

    getSeason: async (groupId, number) => {
        const ref = doc(db, 'groups', groupId, 'seasons', seasonDocId(number));
        const snap = await getDoc(ref);
        if (!snap.exists()) return null;
        return { id: snap.id, ...snap.data() };
    },

    subscribeToSeasons: (groupId, callback, onError) => {
        return onSnapshot(
            query(seasonsCol(groupId), orderBy('number', 'desc')),
            (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
            (err) => {
                console.error('[SeasonService] subscribeToSeasons error:', err);
                onError?.(err);
            },
        );
    },

    /** End the expected season from fresh standings, unless a match is live. */
    endSeason: async (groupId, uid, expectedSeason) => {
        const groupRef = doc(db, 'groups', groupId);
        return runTransaction(db, async transaction => {
            const snap = await transaction.get(groupRef);
            if (!snap.exists()) throw new Error('GROUP_NOT_FOUND');
            const group = { ...snap.data(), id: groupId };
            if (!uid || !(group.adminId === uid || group.adminIds?.includes(uid))) throw new Error('ADMIN_REQUIRED');
            const defaults = withSeasonDefaults(group);
            if (defaults.seasonNumber !== expectedSeason) throw new Error('SEASON_ALREADY_ENDED');
            if (group.liveGameId) {
                const liveGame = await transaction.get(doc(db, 'games', group.liveGameId));
                if (liveGame.exists()) throw new Error('GAME_IN_PROGRESS');
            }
            const { archive, nextGroupFields } = rolloverSeason({ ...group, ...defaults }, {
                endReason: 'manual', endedBy: uid,
            });
            const archiveRef = doc(db, 'groups', groupId, 'seasons', seasonDocId(archive.number));
            const existing = await transaction.get(archiveRef);
            if (existing.exists()) throw new Error('SEASON_ALREADY_ENDED');
            transaction.set(archiveRef, archive);
            transaction.update(groupRef, { ...nextGroupFields, liveGameId: null });
            return { ...group, ...nextGroupFields, liveGameId: null };
        });
    },
};

export default SeasonService;
