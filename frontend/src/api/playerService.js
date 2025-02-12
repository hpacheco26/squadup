import axios from 'axios';

const API_URL = 'http://localhost:3000/api/players';

const PlayerService = {
    // Fetch all players
    getAllPlayers: async () => {
        try {
            const response = await axios.get(API_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching players:', error);
            throw error;
        }
    },

    // Fetch a player by ID
    getPlayerById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching player:', error);
            throw error;
        }
    },

    // Fetch a player by userId
    getPlayerByUserId: async (userId) => {
        try {
            const response = await axios.get(`${API_URL}/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching player by userId:', error);
            throw error;
        }
    },

    // Create a new player
    createPlayer: async (playerData) => {
        try {
            const response = await axios.post(API_URL, playerData);
            return response.data;
        } catch (error) {
            console.error('Error creating player:', error);
            throw error;
        }
    },

    // Check if a player exists by userId
    checkPlayerExists: async (userId) => {
        try {
            const response = await axios.get(`${API_URL}/user/${userId}`);
            return !!response.data; // Returns true if player exists, false otherwise
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return false; // Player not found
            }
            console.error('Error checking if player exists:', error);
            throw error;
        }
    },

    // Update player details
    updatePlayer: async (id, updatedData) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, updatedData);
            return response.data;
        } catch (error) {
            console.error('Error updating player:', error);
            throw error;
        }
    },

    // Delete a player
    deletePlayer: async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
        } catch (error) {
            console.error('Error deleting player:', error);
            throw error;
        }
    }
};

export default PlayerService;
