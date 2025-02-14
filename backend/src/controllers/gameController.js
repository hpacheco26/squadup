const db = require('../config/firebase'); // Import Firestore database

// Create a new game
const createGameHandler = async (req, res) => {
    try {
        const gameData = req.body;
        const gameRef = await db.collection('games').add(gameData);
        const newGame = { id: gameRef.id, ...gameData };
        res.status(201).json(newGame);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all games
const getAllGamesHandler = async (req, res) => {
    try {
        const gamesSnapshot = await db.collection('games').get();
        const games = gamesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.status(200).json(games);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single game by ID
const getGameByIdHandler = async (req, res) => {
    try {
        const gameDoc = await db.collection('games').doc(req.params.id).get();
        if (!gameDoc.exists) return res.status(404).json({ error: "Game not found" });

        res.status(200).json({ id: gameDoc.id, ...gameDoc.data() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get games by group ID
const getGamesByGroupHandler = async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const gamesSnapshot = await db.collection('games')
            .where('groupId', '==', groupId)
            .get();

        if (gamesSnapshot.empty) {
            return res.status(404).json({ error: "No games found for this group" });
        }

        const games = gamesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.status(200).json(games);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a game by ID
const updateGameHandler = async (req, res) => {
    try {
        const gameRef = db.collection('games').doc(req.params.id);
        await gameRef.update(req.body);
        
        const updatedGame = await gameRef.get();
        res.status(200).json({ id: updatedGame.id, ...updatedGame.data() });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a game by ID
const deleteGameHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const gameRef = db.collection('games').doc(id);
        const groupDoc = await groupRef.get();

        if (!groupDoc.exists) {
            return res.status(404).json({ error: 'Group not found' });
        }

        await gameRef.delete();
        res.status(200).json({ message: "Game deleted successfully" });
    } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


module.exports = {
    createGameHandler,
    getAllGamesHandler,
    getGameByIdHandler,
    getGamesByGroupHandler,
    updateGameHandler,
    deleteGameHandler
};