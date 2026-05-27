import { db } from '../config/firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';

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
        const docRef = await addDoc(gamesRef, gameData);
        return { id: docRef.id, ...gameData };
    },

    updateGame: async (id, updatedData) => {
        const gameRef = doc(db, 'games', id);
        await updateDoc(gameRef, updatedData);
        const updated = await getDoc(gameRef);
        return { id: updated.id, ...updated.data() };
    },

    deleteGame: async (id) => {
        await deleteDoc(doc(db, 'games', id));
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
