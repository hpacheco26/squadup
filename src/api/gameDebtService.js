import { db } from '../config/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, query, where, onSnapshot, FieldPath } from 'firebase/firestore';

const gameDebtsRef = collection(db, 'gameDebts');

const GameDebtService = {
    // Create a game debt record when a game ends
    createGameDebt: async (data) => {
        const docRef = await addDoc(gameDebtsRef, data);
        return { id: docRef.id, ...data };
    },

    // Subscribe to all game debts for a group
    subscribeToGameDebtsByGroup: (groupId, callback, onError) => {
        const q = query(gameDebtsRef, where('groupId', '==', groupId));
        return onSnapshot(
            q,
            (snapshot) => {
                const debts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                callback(debts);
            },
            (err) => {
                console.error('[GameDebtService] subscribeToGameDebtsByGroup error:', err);
                onError?.(err);
            }
        );
    },

    // Mark a player as paid in a specific game debt
    // Uses FieldPath to safely handle player IDs that contain dots (e.g. "Mario.Lopes-uid")
    markPlayerPaid: async (gameDebtId, playerId) => {
        const ref = doc(db, 'gameDebts', gameDebtId);
        await updateDoc(ref, new FieldPath('debts', playerId, 'paid'), true);
    },

    // Delete a game debt (when fully paid)
    deleteGameDebt: async (gameDebtId) => {
        await deleteDoc(doc(db, 'gameDebts', gameDebtId));
    },
};

export default GameDebtService;
