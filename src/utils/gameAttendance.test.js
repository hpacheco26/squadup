import { describe, it, expect } from 'vitest';
import { removeFromLineup } from './gameAttendance';

const p = (id) => ({ id, firstName: 'P', lastName: id });

describe('removeFromLineup', () => {
    it('returns null when the player is not in the lineup', () => {
        const game = { team1: [p('a')], team2: [p('b')], injured: [] };
        expect(removeFromLineup(game, 'zzz')).toBeNull();
    });

    it('returns null for bad input', () => {
        expect(removeFromLineup(null, 'a')).toBeNull();
        expect(removeFromLineup({}, null)).toBeNull();
        expect(removeFromLineup({ team1: 'nope' }, 'a')).toBeNull();
    });

    it('removes the player from team1/team2 and injured', () => {
        const game = {
            team1: [p('a'), p('b')],
            team2: [p('a'), p('c')],
            injured: [p('a'), p('d')],
        };
        expect(removeFromLineup(game, 'a')).toEqual({
            team1: [p('b')],
            team2: [p('c')],
            injured: [p('d')],
        });
    });

    it('only reports fields that actually changed', () => {
        const game = { team1: [p('a'), p('b')], team2: [p('c')] };
        expect(removeFromLineup(game, 'a')).toEqual({ team1: [p('b')] });
    });

    it('does not touch attendance lists or payments', () => {
        const game = {
            team1: [p('a')],
            playersIn: [p('a')],
            playersOut: [],
            payments: { a: true },
        };
        const updates = removeFromLineup(game, 'a');
        expect(updates).toEqual({ team1: [] });
        expect(updates.playersIn).toBeUndefined();
        expect(updates.payments).toBeUndefined();
    });
});
