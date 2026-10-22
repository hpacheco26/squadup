import { describe, expect, it } from 'vitest';
import { seasonMarkerKey, unseenSeason } from './seasonNotifications';

describe('season recap delivery', () => {
    it('shows the latest ended season on a first visit', () => {
        expect(unseenSeason({ seasonNumber: 4 }, null)).toBe(3);
    });
    it('shows only the latest when several seasons were missed', () => {
        expect(unseenSeason({ seasonNumber: 4 }, '1')).toBe(3);
    });
    it('does not show acknowledged seasons or the launch season', () => {
        expect(unseenSeason({ seasonNumber: 1 }, '1')).toBeNull();
        expect(unseenSeason({ seasonNumber: 0 }, null)).toBeNull();
    });
    it('scopes acknowledgement to auth identity and group', () => {
        expect(seasonMarkerKey('uid', 'group')).toBe('season:lastSeen:uid:group');
        expect(seasonMarkerKey('uid2', 'group')).not.toBe(seasonMarkerKey('uid', 'group'));
    });
});
