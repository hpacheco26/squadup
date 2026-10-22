import { db } from '../config/firebase';
import { collection, doc, getDoc, getDocFromServer, getDocs, updateDoc, query, where, onSnapshot, runTransaction } from 'firebase/firestore';
import { buildGameCompletion } from '../utils/gameCompletion';
import { seasonDocId } from '../utils/seasons';

const gamesRef = collection(db, 'games');

const GameService = {
    getGames: async () => {
        const snapshot = await getDocs(gamesRef);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    getGameById: async (id) => {
        const docSnap = await getDoc(doc(db, 'games', id));
        if (!docSnap.exists()) return null;
        return { id: docSnap.id, ...docSnap.data() };
    },

    getGamesByGroup: async (groupId) => {
        const q = query(gamesRef, where('groupId', '==', groupId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    createGame: async (gameData) => {
        if (gameData.groupId) {
            const q = query(gamesRef, where('groupId', '==', gameData.groupId));
            const existing = await getDocs(q);
            if (!existing.empty) {
                const err = new Error('GAME_ALREADY_EXISTS');
                err.code = 'GAME_ALREADY_EXISTS';
                throw err;
            }
        }
        const docRef = doc(gamesRef);
        const groupRef = doc(db, 'groups', gameData.groupId);
        return runTransaction(db, async transaction => {
            const group = await transaction.get(groupRef);
            if (!group.exists()) throw new Error('GROUP_NOT_FOUND');
            if (group.data().activeGameId) {
                const active = await transaction.get(doc(db, 'games', group.data().activeGameId));
                if (active.exists()) {
                    const error = new Error('GAME_ALREADY_EXISTS');
                    error.code = 'GAME_ALREADY_EXISTS';
                    throw error;
                }
            }
            transaction.set(docRef, gameData);
            transaction.update(groupRef, { activeGameId: docRef.id });
            return { id: docRef.id, ...gameData };
        });
    },

    updateGame: async (id, updatedData) => {
        const gameRef = doc(db, 'games', id);
        await updateDoc(gameRef, updatedData);
        const updated = await getDoc(gameRef);
        return { id: updated.id, ...updated.data() };
    },

    deleteGame: async (id) => {
        const gameRef = doc(db, 'games', id);
        await runTransaction(db, async transaction => {
            const game = await transaction.get(gameRef);
            if (!game.exists()) return;
            const groupRef = doc(db, 'groups', game.data().groupId);
            const group = await transaction.get(groupRef);
            if (group.exists()) {
                const fields = {};
                if (group.data().activeGameId === id) fields.activeGameId = null;
                if (group.data().liveGameId === id) fields.liveGameId = null;
                if (Object.keys(fields).length) transaction.update(groupRef, fields);
            }
            transaction.delete(gameRef);
        });
    },

    startGame: async (id, uid) => runTransaction(db, async transaction => {
        const gameRef = doc(db, 'games', id);
        const game = await transaction.get(gameRef);
        if (!game.exists()) throw new Error('GAME_NOT_FOUND');
        const groupRef = doc(db, 'groups', game.data().groupId);
        const snap = await transaction.get(groupRef);
        if (!snap.exists()) throw new Error('GROUP_NOT_FOUND');
        const group = snap.data();
        if (!uid || !(group.adminId === uid || group.adminIds?.includes(uid))) throw new Error('ADMIN_REQUIRED');
        if (group.liveGameId && group.liveGameId !== id) throw new Error('GAME_IN_PROGRESS');
        transaction.update(groupRef, { liveGameId: id, activeGameId: id });
    }),

    completeGame: async (groupId, gameId, score, uid) => {
        const groupRef = doc(db, 'groups', groupId);
        const gameRef = doc(db, 'games', gameId);
        const receiptRef = doc(db, 'groups', groupId, 'completedGames', gameId);
        const nextGameRef = doc(gamesRef);
        return runTransaction(db, async transaction => {
            const [receipt, groupSnap, gameSnap] = await Promise.all([
                transaction.get(receiptRef), transaction.get(groupRef), transaction.get(gameRef),
            ]);
            if (!groupSnap.exists()) throw new Error('GROUP_NOT_FOUND');
            const group = { ...groupSnap.data(), id: groupId };
            if (!uid || !(group.adminId === uid || group.adminIds?.includes(uid))) throw new Error('ADMIN_REQUIRED');
            if (receipt.exists()) return { ...receipt.data(), alreadyCompleted: true };
            if (!gameSnap.exists() || gameSnap.data().groupId !== groupId) throw new Error('GAME_NOT_FOUND');
            if (group.liveGameId && group.liveGameId !== gameId) throw new Error('GAME_IN_PROGRESS');
            const completion = buildGameCompletion(group, { ...gameSnap.data(), id: gameId }, score);
            const archiveRef = completion.archive
                ? doc(db, 'groups', groupId, 'seasons', seasonDocId(completion.archive.number)) : null;
            if (archiveRef && (await transaction.get(archiveRef)).exists()) throw new Error('SEASON_ALREADY_ENDED');
            const result = {
                groupId, gameId, ...score, completedAt: Date.now(), completedBy: uid,
                seasonEnded: !!completion.archive,
                seasonNumber: completion.groupFields.seasonNumber,
                nextGameId: completion.nextGame ? nextGameRef.id : null,
            };
            if (archiveRef) transaction.set(archiveRef, completion.archive);
            if (completion.debt) transaction.set(doc(db, 'gameDebts', gameId), completion.debt);
            if (completion.nextGame) transaction.set(nextGameRef, completion.nextGame);
            transaction.update(groupRef, {
                ...completion.groupFields, liveGameId: null,
                activeGameId: completion.nextGame ? nextGameRef.id : null,
            });
            transaction.set(receiptRef, result);
            transaction.delete(gameRef);
            return result;
        }).catch(async error => {
            if (!['permission-denied', 'aborted'].includes(error.code)) throw error;
            // A competing commit can make get()-based rules reject a stale attempt
            // before the SDK retries it. Only a server-confirmed receipt is success.
            const [receipt, group] = await Promise.all([
                getDocFromServer(receiptRef), getDocFromServer(groupRef),
            ]);
            if (receipt.exists() && group.exists()
                && (group.data().adminId === uid || group.data().adminIds?.includes(uid))) {
                return { ...receipt.data(), alreadyCompleted: true };
            }
            throw error;
        });
    },

    subscribeToGame: (id, callback, onError) => {
        return onSnapshot(
            doc(db, 'games', id),
            (docSnap) => {
                if (docSnap.exists()) {
                    callback({ id: docSnap.id, ...docSnap.data() });
                } else {
                    callback(null);
                }
            },
            (err) => {
                console.error('[GameService] subscribeToGame error:', err);
                onError?.(err);
            }
        );
    },

    subscribeToGamesByGroup: (groupId, callback, onError) => {
        const q = query(gamesRef, where('groupId', '==', groupId));
        return onSnapshot(
            q,
            (snapshot) => {
                const games = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                callback(games);
            },
            (err) => {
                console.error('[GameService] subscribeToGamesByGroup error:', err);
                onError?.(err);
            }
        );
    },
};

export default GameService;
