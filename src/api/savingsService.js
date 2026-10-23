import { db } from '../config/firebase';
import { doc, runTransaction } from 'firebase/firestore';

/**
 * Group savings balance. The fund moves in three places, all transactional:
 * game completion books the field cost (GameService.completeGame), debt
 * payments book the fees (GameDebtService.markPlayerPaid), and this service
 * handles manual treasury adjustments/spends. No history is kept by design —
 * the balance is the only state.
 */
const SavingsService = {
    /**
     * Move the group balance by a manual treasury entry.
     * @param {string} groupId
     * @param {{ type: 'adjustment'|'spend', delta: number }} input
     *   delta > 0 adds to the fund (adjustment), delta < 0 spends from it.
     * @returns {Promise<{ balanceAfter: number }>}
     */
    addEntry: async (groupId, { type, delta }) => {
        if (!['adjustment', 'spend'].includes(type)) throw new Error('INVALID_SAVINGS_TYPE');
        const amount = Math.round(Number(delta) * 100) / 100;
        if (!Number.isFinite(amount) || amount === 0) throw new Error('INVALID_SAVINGS_AMOUNT');
        const groupRef = doc(db, 'groups', groupId);
        return runTransaction(db, async (transaction) => {
            const snap = await transaction.get(groupRef);
            if (!snap.exists()) throw new Error('GROUP_NOT_FOUND');
            const balance = Number(snap.data().savingsBalance) || 0;
            const balanceAfter = Math.round((balance + amount) * 100) / 100;
            transaction.update(groupRef, { savingsBalance: balanceAfter });
            return { balanceAfter };
        });
    },
};

export default SavingsService;
