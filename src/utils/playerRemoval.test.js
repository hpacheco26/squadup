import { describe, it, expect } from 'vitest';
import { stripPlayerFromGame, stripPlayerFromDebt } from './playerRemoval';

const member = (id, extra = {}) => ({ id, firstName: 'P', lastName: id, ...extra });

describe('stripPlayerFromGame', () => {
    it('returns null when the player is not referenced', () => {
        const game = { playersIn: [member('a')], playersOut: [], payments: { a: true } };
        expect(stripPlayerFromGame(game, 'zzz')).toBeNull();
    });

    it('returns null for bad input', () => {
        expect(stripPlayerFromGame(null, 'a')).toBeNull();
        expect(stripPlayerFromGame({}, null)).toBeNull();
    });

    it('removes the player from every attendance list and team', () => {
        const game = {
            playersInvited: [member('a'), member('b')],
            playersIn: [member('a')],
            playersOut: [member('b'), member('a')],
            team1: [member('a'), member('b')],
            team2: [member('b')],
            injured: [member('a')],
        };
        const updates = stripPlayerFromGame(game, 'a');
        expect(updates.playersInvited).toEqual([member('b')]);
        expect(updates.playersIn).toEqual([]);
        expect(updates.playersOut).toEqual([member('b')]);
        expect(updates.team1).toEqual([member('b')]);
        expect(updates.team2).toBeUndefined();
        expect(updates.injured).toEqual([]);
    });

    it('removes guests added by the player, including their payments', () => {
        const guest = { id: 'guest-1', guest: true, addedBy: 'a', firstName: 'G' };
        const game = {
            playersIn: [member('a'), guest, member('b')],
            team1: [guest, member('b')],
            payments: { a: true, 'guest-1': true, b: false },
        };
        const updates = stripPlayerFromGame(game, 'a');
        expect(updates.playersIn).toEqual([member('b')]);
        expect(updates.team1).toEqual([member('b')]);
        expect(updates.payments).toEqual({ b: false });
    });

    it('keeps guests added by someone else', () => {
        const guest = { id: 'guest-1', guest: true, addedBy: 'b', firstName: 'G' };
        const game = { playersIn: [member('a'), guest] };
        const updates = stripPlayerFromGame(game, 'a');
        expect(updates.playersIn).toEqual([guest]);
    });
});

describe('stripPlayerFromDebt', () => {
    it('returns null when the player has no debt entry', () => {
        expect(stripPlayerFromDebt({ debts: { a: { amount: 5 } } }, 'b')).toBeNull();
        expect(stripPlayerFromDebt({}, 'a')).toBeNull();
        expect(stripPlayerFromDebt(null, 'a')).toBeNull();
    });

    it('removes only the target entry and reports remaining debts', () => {
        const doc = { debts: { a: { amount: 5, paid: false }, b: { amount: 5, paid: true } } };
        expect(stripPlayerFromDebt(doc, 'a')).toEqual({
            debts: { b: { amount: 5, paid: true } },
            empty: false,
        });
    });

    it('flags the document as empty when the last debt is removed', () => {
        const doc = { debts: { a: { amount: 5, paid: false } } };
        expect(stripPlayerFromDebt(doc, 'a')).toEqual({ debts: {}, empty: true });
    });
});
