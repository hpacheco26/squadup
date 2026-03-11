import { db } from '../config/firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

const playersRef = collection(db, 'players');

const PlayerService = {
    getAllPlayers: async () => {
        const snapshot = await getDocs(playersRef);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    getPlayerById: async (id) => {
        const docSnap = await getDoc(doc(db, 'players', id));
        if (!docSnap.exists()) return null;
        return { id: docSnap.id, ...docSnap.data() };
    },

    getPlayerByUserId: async (userId) => {
        const q = query(playersRef, where('userId', '==', userId));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    },

    createPlayer: async (playerData) => {
        const { id, ...data } = playerData;
        await setDoc(doc(db, 'players', id), { id, ...data });
        return playerData;
    },

    checkPlayerExists: async (userId) => {
        const q = query(playersRef, where('userId', '==', userId));
        const snapshot = await getDocs(q);
        return !snapshot.empty;
    },

    updatePlayer: async (id, updatedData) => {
        await updateDoc(doc(db, 'players', id), updatedData);
    },

    deletePlayer: async (id) => {
        await deleteDoc(doc(db, 'players', id));
    }
};

export default PlayerService;
