import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    groupCallback: null,
    groupsCallback: null,
    auth: { user: { uid: 'uid' }, playerData: { id: 'account-id' } },
    getSeason: vi.fn(),
    completeGame: vi.fn(),
}));
vi.mock('./authStore', () => ({ default: { getState: () => mocks.auth } }));
vi.mock('../api/groupService', () => ({
    default: {
        subscribeToGroup: vi.fn((_id, callback) => { mocks.groupCallback = callback; return () => {}; }),
        subscribeToGroupsByUser: vi.fn((_uid, callback) => { mocks.groupsCallback = callback; return () => {}; }),
    },
}));
vi.mock('../api/seasonService', () => ({ default: { getSeason: mocks.getSeason } }));
vi.mock('../api/gameService', () => ({ default: { completeGame: mocks.completeGame } }));

import useGroupStore from './groupStore';

const group = (id, seasonNumber = 1) => ({
    id, name: id, seasonNumber, players: [{ id: 'claimed-slot', userId: 'uid', rank: 0 }],
});
const archive = (number = 0) => ({
    number, gamesPlayed: 48,
    standings: [{ id: 'claimed-slot', userId: 'uid', rank: 4, wins: 30, draws: 10, losses: 8, position: 1 }],
});

beforeEach(async () => {
    await Promise.resolve();
    localStorage.clear();
    mocks.getSeason.mockReset().mockResolvedValue(archive());
    mocks.completeGame.mockReset();
    useGroupStore.setState({
        groups: [], group: null, pendingSeasonRecaps: [], pendingRankChanges: [], seasonRecapError: null,
        recapPendingKeys: [],
        _unsubGroups: null, _unsubGroup: null,
    });
});

describe('season-aware group notifications', () => {
    it('queues recaps from the global groups listener on first visit and uses claimed roster identity', async () => {
        useGroupStore.getState().subscribeToGroupsByUser('uid');
        mocks.groupsCallback([group('g1')]);
        await vi.waitFor(() => expect(useGroupStore.getState().pendingSeasonRecaps).toHaveLength(1));
        expect(useGroupStore.getState().pendingSeasonRecaps[0]).toMatchObject({ rank: 4, position: 1, groupId: 'g1' });
        useGroupStore.getState().acknowledgeSeasonRecap();
        expect(localStorage.getItem('season:lastSeen:uid:g1')).toBe('1');
    });

    it('queues multiple groups instead of overwriting the pending recap', async () => {
        useGroupStore.getState().subscribeToGroupsByUser('uid');
        mocks.groupsCallback([group('g1'), group('g2')]);
        await vi.waitFor(() => expect(useGroupStore.getState().pendingSeasonRecaps).toHaveLength(2));
        useGroupStore.getState().acknowledgeSeasonRecap();
        expect(useGroupStore.getState().pendingSeasonRecaps).toHaveLength(1);
    });

    it('suppresses stale rank-change gates and loads the latest missed season', async () => {
        localStorage.setItem('season:lastSeen:uid:g1', '0');
        useGroupStore.setState({ pendingRankChanges: [{ groupId: 'g1', previousRank: 4, newRank: 0 }] });
        mocks.getSeason.mockResolvedValue(archive(3));
        useGroupStore.getState().subscribeToGroup('g1');
        mocks.groupCallback(group('g1', 4));
        await vi.waitFor(() => expect(mocks.getSeason).toHaveBeenCalledWith('g1', 3));
        expect(useGroupStore.getState().pendingRankChanges).toEqual([]);
    });

    it('does not replay acknowledged recaps', () => {
        localStorage.setItem('season:lastSeen:uid:g1', '1');
        useGroupStore.getState().subscribeToGroupsByUser('uid');
        mocks.groupsCallback([group('g1')]);
        expect(mocks.getSeason).not.toHaveBeenCalled();
    });

    it('keeps an explicit error and does not acknowledge when loading fails', async () => {
        const error = new Error('permission-denied');
        const log = vi.spyOn(console, 'error').mockImplementation(() => {});
        mocks.getSeason.mockRejectedValue(error);
        useGroupStore.getState().subscribeToGroupsByUser('uid');
        mocks.groupsCallback([group('g1')]);
        await vi.waitFor(() => expect(useGroupStore.getState().seasonRecapError).toEqual({ groupId: 'g1', error }));
        expect(localStorage.getItem('season:lastSeen:uid:g1')).toBeNull();
        log.mockRestore();
    });

    it('propagates a completion error so the page cannot treat it as success', async () => {
        const error = new Error('permission-denied');
        const log = vi.spyOn(console, 'error').mockImplementation(() => {});
        mocks.completeGame.mockRejectedValue(error);
        await expect(useGroupStore.getState().completeGame('g1', 'game1', { team1Goals: 1, team2Goals: 0 })).rejects.toThrow('permission-denied');
        log.mockRestore();
    });
});
