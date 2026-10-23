import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import GroupService from '../api/groupService';
import GameService from '../api/gameService';
import GameDebtService from '../api/gameDebtService';
import SavingsService from '../api/savingsService';
import SeasonService from '../api/seasonService';
import { withSeasonDefaults, buildSeasonRecap } from '../utils/seasons';
import { seasonMarkerKey, unseenSeason } from '../utils/seasonNotifications';
import { stripPlayerFromGame, stripPlayerFromDebt } from '../utils/playerRemoval';
import useAuthStore from './authStore';

/**
 * Find the current user's player row in a group, preferring the stable auth uid over the
 * legacy playerData.id. Rows claimed from a pre-created roster slot keep a random id that
 * does NOT equal the claimer's playerData.id, so uid matching is required.
 */
const findMyPlayerRow = (players, uid, playerId) =>
    (players || []).find(p => (uid && p.userId === uid) || (playerId && p.id === playerId)) || null;

const recapRequests = new Map();

const detectPlayerChanges = (group, uid, playerId, set) => {
    const player = findMyPlayerRow(group.players, uid, playerId);
    if (!uid || !player || useAuthStore.getState().user?.uid !== uid) return;
    const seasonKey = seasonMarkerKey(uid, group.id);
    const rankKey = `rank:lastSeen:${playerId || uid}:${group.id}`;
    const endedNumber = unseenSeason(group, localStorage.getItem(seasonKey));
    if (endedNumber !== null) {
        localStorage.setItem(rankKey, String(player.rank));
        set(state => ({
            pendingRankChanges: state.pendingRankChanges.filter(c => c.groupId !== group.id),
        }));
        const requestKey = `${uid}:${group.id}:${endedNumber}`;
        const queued = useGroupStore.getState().pendingSeasonRecaps.some(r => r.groupId === group.id && r.currentSeason === group.seasonNumber);
        if (queued || recapRequests.has(requestKey)) return;
        set(state => ({ recapPendingKeys: [...state.recapPendingKeys, requestKey] }));
        const request = SeasonService.getSeason(group.id, endedNumber).then(season => {
            if (useAuthStore.getState().user?.uid !== uid) return;
            if (!season) {
                // New groups start at Season 1 and have no Season 0 archive.
                if (endedNumber !== 0) throw new Error('SEASON_ARCHIVE_NOT_FOUND');
                localStorage.setItem(seasonKey, String(group.seasonNumber));
                return;
            }
            const archivedPlayer = season.standings?.find(p => p.userId === uid || p.id === player.id);
            const recap = buildSeasonRecap(season, archivedPlayer?.id);
            if (!recap) {
                localStorage.setItem(seasonKey, String(group.seasonNumber));
                return;
            }
            set(state => {
                if (state.pendingSeasonRecaps.some(r => r.groupId === group.id && r.currentSeason > group.seasonNumber)) return {};
                return {
                    seasonRecapError: state.seasonRecapError?.groupId === group.id ? null : state.seasonRecapError,
                    pendingSeasonRecaps: [
                        ...state.pendingSeasonRecaps.filter(r => r.groupId !== group.id),
                        { ...recap, groupId: group.id, groupName: group.name, currentSeason: group.seasonNumber, uid },
                    ],
                };
            });
        }).catch(error => {
            console.error('[groupStore] Failed to load season recap:', error);
            if (useAuthStore.getState().user?.uid === uid) set({ seasonRecapError: { groupId: group.id, error } });
        }).finally(() => {
            recapRequests.delete(requestKey);
            set(state => ({ recapPendingKeys: state.recapPendingKeys.filter(key => key !== requestKey) }));
        });
        recapRequests.set(requestKey, request);
        return;
    }
    if (localStorage.getItem(seasonKey) === null) {
        localStorage.setItem(seasonKey, String(group.seasonNumber ?? 0));
    }
    const previous = localStorage.getItem(rankKey);
    if (previous === null) localStorage.setItem(rankKey, String(player.rank));
    else if (Number(previous) !== player.rank) {
        set(state => ({
            pendingRankChanges: state.pendingRankChanges.some(c => c.groupId === group.id)
                ? state.pendingRankChanges
                : [...state.pendingRankChanges, {
                    groupId: group.id, groupName: group.name, previousRank: Number(previous), newRank: player.rank,
                }],
        }));
    }
};

const useGroupStore = create(
    persist(
        (set) => ({
            groups: [],
            group: null,
            loading: false,
            ranksLoading: false,
            error: null,
            myPlayer: null,
            ranks: [],
            pendingRankChanges: [], // [{ groupId, groupName, previousRank, newRank }]
            pendingSeasonRecaps: [],
            seasonRecapError: null,
            recapPendingKeys: [],

            // Internal unsubscribe references
            _unsubGroup: null,
            _unsubGroups: null,

            // � Real-time subscriptions

            subscribeToGroup: (id) => {
                const prev = useGroupStore.getState()._unsubGroup;
                if (prev) prev();

                const { user, playerData } = useAuthStore.getState();
                const uid = user?.uid;
                const playerId = playerData?.id;
                const unsub = GroupService.subscribeToGroup(id, (group) => {
                    if (group) {
                        const myPlayer = findMyPlayerRow(group.players, uid, playerId);

                        detectPlayerChanges(group, uid, playerId, set);

                        set({ group, myPlayer, loading: false });
                    } else {
                        set({ group: null, myPlayer: null, loading: false, error: 'Group not found' });
                    }
                });
                set({ _unsubGroup: unsub, group: null, myPlayer: null, loading: true });
                return unsub;
            },

            unsubscribeGroup: () => {
                const unsub = useGroupStore.getState()._unsubGroup;
                if (unsub) unsub();
                set({ _unsubGroup: null });
            },

            subscribeToGroupsByUser: (uid) => {
                const prev = useGroupStore.getState()._unsubGroups;
                if (prev) prev();

                const playerId = useAuthStore.getState().playerData?.id;
                const unsub = GroupService.subscribeToGroupsByUser(uid, (groups) => {
                    const ranks = groups.map(group => {
                        const player = findMyPlayerRow(group.players, uid, playerId);
                        if (!player) return null;
                        return {
                            groupId: group.id,
                            groupName: group.name,
                            groupRank: player.rank,
                            stats: player.stats
                        };
                    }).filter(Boolean);

                    groups.forEach(group => detectPlayerChanges(group, uid, playerId, set));

                    set({ groups, ranks, ranksLoading: false });
                });
                set({ _unsubGroups: unsub, ranks: [], ranksLoading: true });
                return unsub;
            },

            unsubscribeGroups: () => {
                const unsub = useGroupStore.getState()._unsubGroups;
                if (unsub) unsub();
                set({ _unsubGroups: null });
            },

            acknowledgeRankChange: (groupId) => {
                const auth = useAuthStore.getState();
                const playerId = auth.playerData?.id || auth.user?.uid;
                const change = useGroupStore.getState().pendingRankChanges.find(c => c.groupId === groupId);
                if (change && playerId) {
                    localStorage.setItem(`rank:lastSeen:${playerId}:${groupId}`, String(change.newRank));
                }
                set(state => ({
                    pendingRankChanges: state.pendingRankChanges.filter(c => c.groupId !== groupId)
                }));
            },

            acknowledgeSeasonRecap: () => {
                const recap = useGroupStore.getState().pendingSeasonRecaps[0];
                if (recap) {
                    localStorage.setItem(seasonMarkerKey(recap.uid, recap.groupId), String(recap.currentSeason));
                }
                set(state => ({ pendingSeasonRecaps: state.pendingSeasonRecaps.slice(1) }));
            },

            retrySeasonRecaps: () => {
                set({ seasonRecapError: null });
                const { user, playerData } = useAuthStore.getState();
                useGroupStore.getState().groups.forEach(group => detectPlayerChanges(group, user?.uid, playerData?.id, set));
            },

            clearPlayerNotifications: () => set({ pendingRankChanges: [], pendingSeasonRecaps: [], seasonRecapError: null, recapPendingKeys: [] }),

            fetchSeasonHistory: async (groupId) => {
                try {
                    return await SeasonService.getSeasons(groupId);
                } catch (error) {
                    console.error('[groupStore] Failed to load season history:', error);
                    throw error;
                }
            },

            // �🔹 Fetch all groups and update ranks
            fetchGroups: async () => {
                try {
                    const groups = await GroupService.getGroups();
                    
                    set({ groups });
                } catch (error) {
                    console.error('Failed to fetch groups:', error);
                }
            },

            // 🔹 Fetch a single group by ID
            fetchGroupById: async (id) => {
                const { user, playerData } = useAuthStore.getState();
                const uid = user?.uid;
                const playerId = playerData?.id;
                set({ group: null, myPlayer: null, loading: true });
                try {
                    const group = await GroupService.getGroupById(id);
                    if (!group) {
                        set({ group: null, myPlayer: null, loading: false, error: 'Group not found' });
                        return;
                    }
                    const myPlayer = findMyPlayerRow(group.players, uid, playerId);
                    set({ group, myPlayer, loading: false });
                } catch (error) {
                    set({ error: 'Failed to fetch group by ID', loading: false });
                    console.error('Failed to fetch group by ID:', error);
                }
            },

            // 🔹 Fetch groups where a specific player is a member
            fetchGroupsByUser: async (uid) => {
                try {
                    const groups = await GroupService.getGroupsByUser(uid);
                    const playerId = useAuthStore.getState().playerData?.id;

                    const ranks = groups.map(group => {
                        const player = findMyPlayerRow(group.players, uid, playerId);
                        if (!player) return null;
                        return {
                            groupId: group.id,
                            groupName: group.name,
                            groupRank: player.rank,
                            stats: player.stats
                        };
                    }).filter(Boolean);

                    set({ groups, ranks });

                } catch (error) {
                    console.error("Error fetching groups:", error);
                    set({ groups: [] }); // Ensure Zustand updates state on error
                }
            },

            // 🔹 Add a new group
            addGroup: async (groupData) => {
                try {
                    const newGroup = await GroupService.createGroup(groupData);
                    set((state) => ({ groups: [...state.groups, newGroup] }));
                } catch (error) {
                    console.error('Failed to add group:', error);
                }
            },

            // 🔹 Update an existing group
            updateGroup: async (id, updatedData) => {
                try {
                    const updatedGroup = await GroupService.updateGroup(id, updatedData);
                    set((state) => ({
                        groups: state.groups.map((group) =>
                            group.id === id ? { ...group, ...updatedGroup } : group
                        ),
                        group: state.group?.id === id ? { ...state.group, ...updatedGroup } : state.group
                    }));
                } catch (error) {
                    console.error('Failed to update group:', error);
                    throw error;
                }
            },

            // 🔹 Delete a group
            deleteGroup: async (id) => {
                try {
                    // Delete all games belonging to this group
                    const games = await GameService.getGamesByGroup(id);
                    await Promise.all(games.map(g => GameService.deleteGame(g.id)));

                    await GroupService.deleteGroup(id);
                    set((state) => ({
                        groups: state.groups.filter((group) => group.id !== id)
                    }));
                } catch (error) {
                    console.error('Failed to delete group:', error);
                }
            },

            // 🔹 Remove a player from the group and every group-scoped collection:
            // roster (plus adminIds/treasury references), all of the group's games
            // (attendance, teams, payments — including guests they added), and all
            // of the group's debt records. The global `players/{id}` doc is kept on
            // purpose: it is the account identity across groups and security rules
            // only let the owner delete it. Season archives and completion receipts
            // are immutable history and are never touched.
            removePlayer: async (groupId, player) => {
                if (!groupId || !player?.id) return;
                const state = useGroupStore.getState();
                const group = (state.group?.id === groupId && state.group)
                    || state.groups.find(g => g.id === groupId)
                    || await GroupService.getGroupById(groupId);
                if (!group) throw new Error('GROUP_NOT_FOUND');

                const updates = { players: (group.players || []).filter(p => p.id !== player.id) };
                if (player.userId && Array.isArray(group.adminIds) && group.adminIds.includes(player.userId)) {
                    updates.adminIds = group.adminIds.filter(uid => uid !== player.userId);
                }
                if (group.treasuryPlayerId === player.id) updates.treasuryPlayerId = null;
                await GroupService.updateGroup(groupId, updates);

                const [games, debts] = await Promise.all([
                    GameService.getGamesByGroup(groupId),
                    GameDebtService.getGameDebtsByGroup(groupId),
                ]);
                await Promise.all([
                    ...games.map(game => {
                        const strip = stripPlayerFromGame(game, player.id);
                        return strip ? GameService.updateGame(game.id, strip) : null;
                    }),
                    ...debts.map(debtDoc => {
                        const strip = stripPlayerFromDebt(debtDoc, player.id);
                        if (!strip) return null;
                        return strip.empty
                            ? GameDebtService.deleteGameDebt(debtDoc.id)
                            : GameDebtService.updateDebts(debtDoc.id, strip.debts);
                    }),
                ]);

                set(state => ({
                    groups: state.groups.map(g => (g.id === groupId ? { ...g, ...updates } : g)),
                    group: state.group?.id === groupId ? { ...state.group, ...updates } : state.group,
                }));
            },

            // 🔹 Move the savings balance (treasury adjustment or year-end spend)
            adjustSavings: async (groupId, { type, delta }) => {
                const uid = useAuthStore.getState().user?.uid;
                if (!uid) throw new Error('AUTH_REQUIRED');
                return SavingsService.addEntry(groupId, { type, delta });
            },

            // The game, result receipt, standings, debt and next fixture commit together.
            completeGame: async (groupId, gameId, score) => {
                try {
                    return await GameService.completeGame(groupId, gameId, score, useAuthStore.getState().user?.uid);
                } catch (error) {
                    console.error('[groupStore] Failed to complete game:', error);
                    set({ error: error.message });
                    throw error;
                }
            },

            endSeasonManually: async (groupId, expectedSeason) => {
                try {
                    const group = useGroupStore.getState().group;
                    if (!group || group.id !== groupId) throw new Error('GROUP_NOT_FOUND');
                    const { user, playerData } = useAuthStore.getState();
                    const rolledGroup = await SeasonService.endSeason(groupId, user?.uid, expectedSeason ?? withSeasonDefaults(group).seasonNumber);
                    set(state => state.group?.id === groupId
                        ? { group: rolledGroup, myPlayer: findMyPlayerRow(rolledGroup.players, user?.uid, playerData?.id) }
                        : {});
                    return { ok: true, seasonNumber: rolledGroup.seasonNumber };
                } catch (error) {
                    console.error('Failed to end season:', error);
                    return { ok: false, reason: error.message === 'GAME_IN_PROGRESS' ? 'game-in-progress' : 'error' };
                }
            },

            endSeasonNow: (groupId, expectedSeason) => useGroupStore.getState().endSeasonManually(groupId, expectedSeason),

            updateSeasonTarget: async (groupId, target) => {
                try {
                    await GroupService.updateGroup(groupId, { gamesPerSeason: target });
                    set(state => ({
                        group: state.group?.id === groupId ? { ...state.group, gamesPerSeason: target } : state.group,
                        groups: state.groups.map(group => group.id === groupId ? { ...group, gamesPerSeason: target } : group),
                    }));
                } catch (error) {
                    console.error('[groupStore] Failed to update season target:', error);
                    throw error;
                }
            },

            setTreasury: async (groupId, treasuryPlayerId, treasuryPhone) => {
                try {
                    await GroupService.updateGroup(groupId, { treasuryPlayerId, treasuryPhone });
                    set((state) => ({
                        group: state.group?.id === groupId
                            ? { ...state.group, treasuryPlayerId, treasuryPhone }
                            : state.group
                    }));
                } catch (error) {
                    console.error('Failed to set treasury:', error);
                }
            },

            accumulateDebts: async (groupId, debtMap) => {
                try {
                    const group = useGroupStore.getState().group;
                    if (!group || group.id !== groupId) return;

                    const updatedPlayers = group.players.map(player => {
                        const amount = debtMap[player.id];
                        if (amount) {
                            return { ...player, debt: Math.round(((player.debt || 0) + amount) * 100) / 100, gamesUnpaid: (player.gamesUnpaid || 0) + 1 };
                        }
                        return player;
                    });

                    await GroupService.updateGroup(groupId, { players: updatedPlayers });
                    set({ group: { ...group, players: updatedPlayers } });
                } catch (error) {
                    console.error('Failed to accumulate debts:', error);
                }
            },

            clearPlayerDebt: async (groupId, playerId) => {
                try {
                    const group = useGroupStore.getState().group;
                    if (!group || group.id !== groupId) return;

                    const updatedPlayers = group.players.map(player => {
                        if (player.id === playerId) {
                            return { ...player, debt: 0, gamesUnpaid: 0 };
                        }
                        return player;
                    });

                    await GroupService.updateGroup(groupId, { players: updatedPlayers });
                    set({ group: { ...group, players: updatedPlayers } });
                } catch (error) {
                    console.error('Failed to clear debt:', error);
                }
            },

            sendPaymentNotification: async (groupId, playerName, amount) => {
                try {
                    const group = useGroupStore.getState().group;
                    if (!group || group.id !== groupId) return;
                    const notifications = group.paymentNotifications || [];
                    const entry = { playerName, amount, timestamp: Date.now() };
                    const updated = [entry, ...notifications].slice(0, 50);
                    await GroupService.updateGroup(groupId, { paymentNotifications: updated });
                    set({ group: { ...group, paymentNotifications: updated } });
                } catch (error) {
                    console.error('Failed to send payment notification:', error);
                }
            },

            dismissNotification: async (groupId, timestamp) => {
                try {
                    const group = useGroupStore.getState().group;
                    if (!group || group.id !== groupId) return;
                    const notifications = (group.paymentNotifications || []).filter(n => n.timestamp !== timestamp);
                    await GroupService.updateGroup(groupId, { paymentNotifications: notifications });
                    set({ group: { ...group, paymentNotifications: notifications } });
                } catch (error) {
                    console.error('Failed to dismiss notification:', error);
                }
            },
        }),
        {
            name: 'group-store',
            getStorage: () => localStorage,
            partialize: (state) => ({ groups: state.groups }),
        }
    )
);

export default useGroupStore;
