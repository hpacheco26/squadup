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

}));

export default useGroupStore;
