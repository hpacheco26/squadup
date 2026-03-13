import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import GroupService from '../api/groupService';
import GameService from '../api/gameService';
import useAuthStore from './authStore';

const useGroupStore = create(
    persist(
        (set) => ({
            groups: [],
            group: null,
            loading: false,
            error: null,
            myPlayer: null,
            ranks: [],

            // Internal unsubscribe references
            _unsubGroup: null,
            _unsubGroups: null,

            // � Real-time subscriptions

            subscribeToGroup: (id) => {
                const prev = useGroupStore.getState()._unsubGroup;
                if (prev) prev();

                const playerId = useAuthStore.getState().playerData?.id;
                const unsub = GroupService.subscribeToGroup(id, (group) => {
                    if (group) {
                        const myPlayer = group.players.find(player => player.id === playerId) || null;
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

            subscribeToGroupsByPlayer: (playerId) => {
                const prev = useGroupStore.getState()._unsubGroups;
                if (prev) prev();

                const unsub = GroupService.subscribeToGroupsByPlayer(playerId, (groups) => {
                    const ranks = groups.map(group => {
                        const player = group.players.find(p => p.id === playerId);
                        if (!player) return null;
                        return {
                            groupId: group.id,
                            groupName: group.name,
                            groupRank: player.rank,
                            stats: player.stats
                        };
                    }).filter(Boolean);
                    set({ groups, ranks });
                });
                set({ _unsubGroups: unsub });
                return unsub;
            },

            unsubscribeGroups: () => {
                const unsub = useGroupStore.getState()._unsubGroups;
                if (unsub) unsub();
                set({ _unsubGroups: null });
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
                const playerId = useAuthStore.getState().playerData?.id;
                set({ group: null, myPlayer: null, loading: true });
                try {
                    const group = await GroupService.getGroupById(id);
                    if (!group) {
                        set({ group: null, myPlayer: null, loading: false, error: 'Group not found' });
                        return;
                    }
                    const myPlayer = group.players.find(player => player.id === playerId) || null;
                    set({ group, myPlayer, loading: false });
                } catch (error) {
                    set({ error: 'Failed to fetch group by ID', loading: false });
                    console.error('Failed to fetch group by ID:', error);
                }
            },

            // 🔹 Fetch groups where a specific player is a member
            fetchGroupsByPlayer: async (playerId) => {
                try {
                    const groups = await GroupService.getGroupsByPlayer(playerId);

                    const ranks = groups.map(group => {
                        const player = group.players.find(p => p.id === playerId);
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

            updateRank: async (groupId, winningTeam, losingTeam, isDraw = false) => {
                if (winningTeam.length === 0 && losingTeam.length === 0) return;
            
                try {
                    set((state) => {
                        if (!state.group || state.group.id !== groupId) return state;
            
                        const updatedPlayers = state.group.players.map((player) => {
                            if (isDraw) {
                                // Both teams draw
                                if (winningTeam.some(p => p.id === player.id) || losingTeam.some(p => p.id === player.id)) {
                                    return {
                                        ...player,
                                        stats: {
                                            ...player.stats,
                                            draws: (player.stats.draws || 0) + 1,
                                        }
                                    };
                                }
                                return player;
                            }
                            // Handle the winning team stats and rank update
                            if (winningTeam.some(p => p.id === player.id)) {
                                return {
                                    ...player,
                                    rank: Math.min(player.rank + 1, 4), // Max rank = 4
                                    stats: {
                                        ...player.stats,
                                        wins: player.stats.wins + 1, // Increase wins
                                    }
                                };
                            }
                            // Handle the losing team stats and rank update
                            if (losingTeam.some(p => p.id === player.id)) {
                                return {
                                    ...player,
                                    rank: Math.max(player.rank - 1, 0), // Min rank = 0
                                    stats: {
                                        ...player.stats,
                                        losses: player.stats.losses + 1, // Increase losses
                                    }
                                };
                            }
                            // Return unchanged player for non-winning and non-losing players
                            return player;
                        });
            
                        // Return updated state immediately
                        return {
                            ...state,
                            group: { ...state.group, players: updatedPlayers }
                        };
                    });
            
                    // Fetch the latest state with updated ranks and stats
                    const updatedGroup = useGroupStore.getState().group;

                    // Update myPlayer to reflect new stats/rank
                    const playerId = useAuthStore.getState().playerData?.id;
                    if (updatedGroup && playerId) {
                        const updatedMyPlayer = updatedGroup.players.find(p => p.id === playerId) || null;
                        set({ myPlayer: updatedMyPlayer });
                    }
            
                    // Save updated group to backend
                    if (updatedGroup) {
                        await GroupService.updateGroup(groupId, updatedGroup);
                    }
            
                    console.log('Ranks and stats updated successfully.');
                } catch (error) {
                    console.error('Failed to update ranks and stats:', error);
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
            partialize: (state) => ({ groups: state.groups, ranks: state.ranks }),
        }
    )
);

export default useGroupStore;
