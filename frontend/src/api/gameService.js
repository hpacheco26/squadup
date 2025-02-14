import axios from 'axios';

const API_URL = 'http://localhost:3000/api/games';

const GameService = {
    // 🔹 Fetch all games
    getGames: async () => {
        try {
            const response = await axios.get(API_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching games:', error);
            throw error;
        }
    },

    // 🔹 Fetch a single game by ID
    getGameById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching game:', error);
            throw error;
        }
    },

    // 🔹 Fetch games for a specific group
    getGamesByGroup: async (groupId) => {
        try {
            const response = await axios.get(`${API_URL}/group/${groupId}`);
            return response.data || []; // Ensure an array is always returned
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.warn(`No games found for group ${groupId}.`);
                return []; // Return empty array for 404 Not Found
            }
    
            console.error('Error fetching group games:', error);
            return []; // Return an empty array instead of throwing the error
        }
    },

    // 🔹 Create a new game
    createGame: async (gameData) => {
        try {
            const response = await axios.post(API_URL, gameData);
            return response.data;
        } catch (error) {
            console.error('Error creating game:', error);
            throw error;
        }
    },

    // 🔹 Update an existing game
    updateGame: async (id, updatedData) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, updatedData);
            return response.data;
        } catch (error) {
            console.error('Error updating game:', error);
            throw error;
        }
    },

    // 🔹 Delete a game
    deleteGame: async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
        } catch (error) {
            console.error('Error deleting game:', error);
            throw error;
        }
    },
};

export default GameService;
