import api from './axiosInstance';

const API_URL = `${import.meta.env.VITE_API_URL}/groups`;

const GroupService = {
    // 🔹 Fetch all groups
    getGroups: async () => {
        try {
            const response = await api.get(API_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching groups:', error);
            throw error;
        }
    },

    // 🔹 Fetch a single group by ID
    getGroupById: async (id) => {
        try {
            const response = await api.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching group:', error);
            throw error;
        }
    },

    getGroupsByPlayer: async (playerId) => {
        try {
            const response = await api.get(`${API_URL}/player/${playerId}`);
            return response.data || [];
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.warn(`No groups found for player ${playerId}.`);
                return [];
            }
    
            console.error('Error fetching player groups:', error);
            return [];
        }
    },
    

    // 🔹 Create a new group
    createGroup: async (groupData) => {
        try {
            const response = await api.post(API_URL, groupData);
            return response.data;
        } catch (error) {
            console.error('Error creating group:', error);
            throw error;
        }
    },

    // 🔹 Update an existing group
    updateGroup: async (id, updatedData) => {
        try {
            const response = await api.put(`${API_URL}/${id}`, updatedData);
            return response.data;
        } catch (error) {
            console.error('Error updating group:', error);
            throw error;
        }
    },

    // 🔹 Delete a group
    deleteGroup: async (id) => {
        try {
            await api.delete(`${API_URL}/${id}`);
        } catch (error) {
            console.error('Error deleting group:', error);
            throw error;
        }
    },
    
};

export default GroupService;
