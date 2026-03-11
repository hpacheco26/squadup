import { create } from 'zustand';
import InviteService from '../api/inviteService';

const useInviteStore = create((set) => ({
    invite: null,
    invites: [],
    loading: false,
    error: null,

    createInvite: async ({ groupId, groupName, createdBy }) => {
        set({ loading: true, error: null });
        try {
            const invite = await InviteService.createInvite({ groupId, groupName, createdBy });
            set((state) => ({ invite, invites: [...state.invites, invite], loading: false }));
            return invite;
        } catch (error) {
            set({ error: error.message, loading: false });
            return null;
        }
    },

    fetchInviteByCode: async (code) => {
        set({ loading: true, error: null });
        try {
            const invite = await InviteService.getInviteByCode(code);
            set({ invite, loading: false });
            return invite;
        } catch (error) {
            set({ error: error.message, loading: false });
            return null;
        }
    },

    fetchInvitesByGroup: async (groupId) => {
        set({ loading: true, error: null });
        try {
            const invites = await InviteService.getInvitesByGroup(groupId);
            set({ invites, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    deactivateInvite: async (code) => {
        try {
            await InviteService.deactivateInvite(code);
            set((state) => ({
                invites: state.invites.map(inv => inv.code === code ? { ...inv, active: false } : inv),
            }));
        } catch (error) {
            console.error('Failed to deactivate invite:', error);
        }
    },
}));

export default useInviteStore;
