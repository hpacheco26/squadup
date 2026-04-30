import { describe, it, expect } from 'vitest';
import getMyInviteStatus from '../../src/utils/myInviteStatus';

const game = (override = {}) => ({
    playersIn: [],
    playersOut: [],
    playersInvited: [],
    ...override,
});

describe('getMyInviteStatus', () => {
    it('returns "in" when player is in playersIn', () => {
        expect(getMyInviteStatus(game({ playersIn: [{ id: 'a' }] }), 'a')).toBe('in');
    });

    it('returns "out" when player is in playersOut', () => {
        expect(getMyInviteStatus(game({ playersOut: [{ id: 'a' }] }), 'a')).toBe('out');
    });

    it('returns "invited" when player is in playersInvited', () => {
        expect(getMyInviteStatus(game({ playersInvited: [{ id: 'a' }] }), 'a')).toBe('invited');
    });

    it('returns null when player is in none', () => {
        expect(getMyInviteStatus(game(), 'a')).toBeNull();
    });

    it('prioritizes "in" over "invited" when player appears in both', () => {
        expect(
            getMyInviteStatus(
                game({ playersIn: [{ id: 'a' }], playersInvited: [{ id: 'a' }] }),
                'a',
            ),
        ).toBe('in');
    });
});
