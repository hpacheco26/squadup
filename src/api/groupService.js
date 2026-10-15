import { db } from '../config/firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';

const groupsRef = collection(db, 'groups');
const allowedCreatorsRef = doc(db, 'config', 'allowedCreators');

/**
 * If `players` is being written, keep derived fields in sync automatically:
 *  - `playerIds`: internal player ids (used for self-join rule lookups)
 *  - `memberUserIds`: Firebase Auth UIDs of players who have linked/claimed an account
 *    (used by the `isSelfJoin()` security rule to verify the joining user)
 *  - `treasuryUserId`: Auth UID of the treasury player (used by the `isGroupTreasury()`
 *    security rule so the treasury can manage/delete debts). Only derived when the write
 *    includes `treasuryPlayerId`, so self-join writes (players only) don't touch it.
 */
const withPlayerIds = (data) => {
    if (!Array.isArray(data.players)) return data;
    const derived = {
        ...data,
        playerIds: data.players.map(p => p.id),
        memberUserIds: data.players.filter(p => p.userId).map(p => p.userId),
    };
    if ('treasuryPlayerId' in data) {
        const treasuryPlayer = data.players.find(p => p.id === data.treasuryPlayerId);
        derived.treasuryUserId = treasuryPlayer?.userId || null;
    }
    return derived;
};

const GroupService = {
    getGroups: async () => {
        const snapshot = await getDocs(groupsRef);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    getGroupById: async (id) => {
        const docSnap = await getDoc(doc(db, 'groups', id));
        if (!docSnap.exists()) return null;
        return { id: docSnap.id, ...docSnap.data() };
    },

    getGroupsByUser: async (uid) => {
        const q = query(groupsRef, where('memberUserIds', 'array-contains', uid));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    canCreateGroup: async (uid) => {
        try {
            const snap = await getDoc(allowedCreatorsRef);
            if (!snap.exists()) return false;
            const { uids } = snap.data();
            return Array.isArray(uids) && uids.includes(uid);
        } catch {
            return false;
        }
    },

    createGroup: async (groupData) => {
        const { name, adminIds, adminId } = groupData;
        const creatorId = (adminIds && adminIds[0]) || adminId;
        const formattedId = `${name.replace(/\s+/g, '').toLowerCase()}-${creatorId}`;
        const dataWithId = withPlayerIds({ ...groupData, id: formattedId });
        await setDoc(doc(db, 'groups', formattedId), dataWithId);
        return dataWithId;
    },

    updateGroup: async (id, updatedData) => {
        const normalized = withPlayerIds(updatedData);
        await updateDoc(doc(db, 'groups', id), normalized);
        return normalized;
    },

    deleteGroup: async (id) => {
        await deleteDoc(doc(db, 'groups', id));
    },

    subscribeToGroup: (id, callback, onError) => {
        return onSnapshot(
            doc(db, 'groups', id),
            (docSnap) => {
                if (docSnap.exists()) {
                    callback({ id: docSnap.id, ...docSnap.data() });
                } else {
                    callback(null);
                }
            },
            (err) => {
                console.error('[GroupService] subscribeToGroup error:', err);
                onError?.(err);
            }
        );
    },

    subscribeToGroupsByUser: (uid, callback, onError) => {
        const q = query(groupsRef, where('memberUserIds', 'array-contains', uid));
        return onSnapshot(
            q,
            (snapshot) => {
                const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                callback(groups);
            },
            (err) => {
                console.error('[GroupService] subscribeToGroupsByUser error:', err);
                onError?.(err);
            }
        );
    },
};

export default GroupService;
