import axios from 'axios';

const API_URL = 'http://localhost:3000/api/groups';

const GroupService = {
    // 🔹 Fetch all groups
    getGroups: async () => {
        try {
            const response = await axios.get(API_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching groups:', error);
            throw error;
        }
    },

    // 🔹 Fetch a single group by ID
    getGroupById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching group:', error);
            throw error;
        }
    },

    getGroupsByPlayer: async (playerId) => {
        try {
            const response = await axios.get(`${API_URL}/player/${playerId}`);
            return response.data || []; // Ensure an array is always returned
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.warn(`No groups found for player ${playerId}.`);
                return []; // Return empty array for 404 Not Found
            }
    
            console.error('Error fetching player groups:', error);
            return []; // Return an empty array instead of throwing the error
        }
    },
    

    // 🔹 Create a new group
    createGroup: async (groupData) => {
        try {
            const response = await axios.post(API_URL, groupData);
            return response.data;
        } catch (error) {
            console.error('Error creating group:', error);
            throw error;
        }
    },

    // 🔹 Update an existing group
    updateGroup: async (id, updatedData) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, updatedData);
            return response.data;
        } catch (error) {
            console.error('Error updating group:', error);
            throw error;
        }
    },

    // 🔹 Delete a group
    deleteGroup: async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
        } catch (error) {
            console.error('Error deleting group:', error);
            throw error;
        }
    },

    // 🔹 Add a player to a specific group
    addPlayerToGroup: async (groupId, playerData) => {
        try {
            const response = await axios.put(`${API_URL}/groups/${groupId}/addPlayer`, playerData);
            return response.data; // Return the updated group data (with new player)
        } catch (error) {
            console.error('Failed to add player to group:', error);
            throw error;
        }
    }
    
};

export default GroupService;
