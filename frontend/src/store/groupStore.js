import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import GroupService from '../api/groupService';
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

            // 🔹 Fetch all groups and update ranks
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
                const playerId = useAuthStore.getState().playerData?.id; // Get player ID from store
                set({ loading: true });
                try {
                    const group = await GroupService.getGroupById(id);
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
                        const rank = {
                            groupName: group.name,
                            groupRank: player.rank,
                            groupStats: player.stats
                        }
                        return player ? rank : null;
                    });

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
                    await GroupService.deleteGroup(id);
                    set((state) => ({
                        groups: state.groups.filter((group) => group.id !== id)
                    }));
                } catch (error) {
                    console.error('Failed to delete group:', error);
                }
            },

            updateRank: async (groupId, winningTeam, losingTeam) => {
                if (winningTeam.length === 0 && losingTeam.length === 0) return;
            
                try {
                    set((state) => {
                        if (!state.group || state.group.id !== groupId) return state;
            
                        const updatedPlayers = state.group.players.map((player) => {
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
            
                    // Save updated group to backend
                    if (updatedGroup) {
                        await GroupService.updateGroup(groupId, updatedGroup);
                    }
            
                    console.log('Ranks and stats updated successfully.');
                } catch (error) {
                    console.error('Failed to update ranks and stats:', error);
                }
            }
        }),
        {
            name: 'group-store', // Key for localStorage
            getStorage: () => localStorage, // Use localStorage for persistence
        }
    )
);

export default useGroupStore;
