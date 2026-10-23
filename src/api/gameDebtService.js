import { db } from '../config/firebase';
import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc, query, where, onSnapshot, runTransaction, FieldPath } from 'firebase/firestore';

const gameDebtsRef = collection(db, 'gameDebts');

const GameDebtService = {
    // Create a game debt record when a game ends
    createGameDebt: async (data) => {
        const docRef = await addDoc(gameDebtsRef, data);
        return { id: docRef.id, ...data };
    },

    // One-shot fetch of all game debts for a group (used by player removal)
    getGameDebtsByGroup: async (groupId) => {
        const q = query(gameDebtsRef, where('groupId', '==', groupId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    // Replace the whole debts map (safe for player ids containing dots)
    updateDebts: async (gameDebtId, debts) => {
        await updateDoc(doc(db, 'gameDebts', gameDebtId), { debts });
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

    // Mark a player as paid in a specific game debt. Uses FieldPath to safely
    // handle player IDs that contain dots (e.g. "Mario.Lopes-uid").
    // Per-player games feed the group fund cash-basis: the payment moves the
    // group balance in the same transaction. Idempotent — marking an
    // already-paid player is a no-op.
    markPlayerPaid: async (gameDebtId, playerId, groupId) => {
        const ref = doc(db, 'gameDebts', gameDebtId);
        const groupRef = doc(db, 'groups', groupId);
        return runTransaction(db, async (transaction) => {
            const [debtSnap, groupSnap] = await Promise.all([
                transaction.get(ref), transaction.get(groupRef),
            ]);
            if (!debtSnap.exists()) return;
            const entry = debtSnap.data().debts?.[playerId];
            if (!entry || entry.paid) return;
            transaction.update(ref, new FieldPath('debts', playerId, 'paid'), true);
            if (debtSnap.data().priceMode !== 'perPlayer' || !groupSnap.exists()) return;
            const amount = Number(entry.amount) || 0;
            const balance = Number(groupSnap.data().savingsBalance) || 0;
            const balanceAfter = Math.round((balance + amount) * 100) / 100;
            transaction.update(groupRef, { savingsBalance: balanceAfter });
        });
    },

    // Delete a game debt (when fully paid)
    deleteGameDebt: async (gameDebtId) => {
        await deleteDoc(doc(db, 'gameDebts', gameDebtId));
    },
};

export default GameDebtService;
