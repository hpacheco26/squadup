import { db } from '../config/firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

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
};

export default GameService;
