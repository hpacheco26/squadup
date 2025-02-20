import { create } from 'zustand';
import GroupService from '../api/groupService';

const useGroupStore = create((set) => ({
    groups: [],
    group: null,
    loading: false,
    error: null,

    // 🔹 Fetch all groups
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
        set({ loading: true });
        try {
            const group = await GroupService.getGroupById(id);
            set({ group, loading: false });
        } catch (error) {
            set({ error: 'Failed to fetch group by ID', loading: false });
            console.error('Failed to fetch group by ID:', error);
        }
    },

    // 🔹 Fetch groups where a specific player is a member
    fetchGroupsByPlayer: async (playerId) => {
        try {
            const data = await GroupService.getGroupsByPlayer(playerId);
            set({ groups: data }); // Always set state, even if empty
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

    // Update ranks inside the group
    updateRank: async (groupId, winningTeam, losingTeam) => {
        if (winningTeam.length === 0 && losingTeam.length === 0) return;

        try {
            // // 🔹 Fetch the group from Firebase
            // const group = await GroupService.getGroupById(groupId);
            // if (!group || !group.players) return;

            // 🔹 Update player ranks
            const updatedPlayers = group.players.map(player => {
                if (winningTeam.includes(player.id)) {
                    return { ...player, rank: Math.min(player.rank + 1, 4) }; // Max rank = 4
                }
                if (losingTeam.includes(player.id)) {
                    return { ...player, rank: Math.max(player.rank - 1, 0) }; // Min rank = 0
                }
                return player; // Unchanged players
            });

            // 🔹 Save updated group
            await GroupService.updateGroup(groupId, { players: updatedPlayers });

            console.log('Ranks updated successfully.');
        } catch (error) {
            console.error('Failed to update ranks:', error);
        }
    }

}));

export default useGroupStore;
