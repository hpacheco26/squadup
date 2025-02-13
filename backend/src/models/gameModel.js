const Game = require('../models/Game'); // Import the Game class
const db = require('../config/firebase'); // Import Firestore database

// Create a new game
exports.createGame = async (req, res) => {
    try {
        const { date, time, location, maxPlayers, minPlayers, invitedPlayers = [], playersGoing = [], playersNotGoing = [], subTime } = req.body;

        // Instantiate the Game class
        const newGame = new Game(
            null, // We will let Firebase handle the ID
            date,
            time,
            location,
            maxPlayers,
            minPlayers,
            invitedPlayers,
            playersGoing,
            playersNotGoing,
            subTime
        );

        // Convert game object to a plain object suitable for Firestore
        const gameData = newGame.toObject();

        // Add the new game to Firestore
        const gameRef = await db.collection('games').add(gameData);
        const createdGame = { id: gameRef.id, ...gameData };

        res.status(201).json(createdGame);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all games
exports.getAllGames = async (req, res) => {
    try {
        const gamesSnapshot = await db.collection('games').get();
        const games = gamesSnapshot.docs.map(doc => {
            const gameData = doc.data();
            const game = new Game(
                doc.id,
                gameData.date,
                gameData.time,
                gameData.location,
                gameData.maxPlayers,
                gameData.minPlayers,
                gameData.invitedPlayers,
                gameData.playersGoing,
                gameData.playersNotGoing,
                gameData.subTime
            );
            return game.toObject();
        });
        res.status(200).json(games);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single game by ID
exports.getGameById = async (req, res) => {
    try {
        const gameDoc = await db.collection('games').doc(req.params.id).get();
        if (!gameDoc.exists) return res.status(404).json({ error: "Game not found" });

        const gameData = gameDoc.data();
        const game = new Game(
            gameDoc.id,
            gameData.date,
            gameData.time,
            gameData.location,
            gameData.maxPlayers,
            gameData.minPlayers,
            gameData.invitedPlayers,
            gameData.playersGoing,
            gameData.playersNotGoing,
            gameData.subTime
        );

        res.status(200).json(game.toObject());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a game by ID
exports.updateGame = async (req, res) => {
    try {
        const gameRef = db.collection('games').doc(req.params.id);

        // Update the game document with the new data
        await gameRef.update(req.body);

        // Get the updated game
        const updatedGameDoc = await gameRef.get();
        const updatedGameData = updatedGameDoc.data();

        // Instantiate the Game class with updated data
        const updatedGame = new Game(
            updatedGameDoc.id,
            updatedGameData.date,
            updatedGameData.time,
            updatedGameData.location,
            updatedGameData.maxPlayers,
            updatedGameData.minPlayers,
            updatedGameData.invitedPlayers,
            updatedGameData.playersGoing,
            updatedGameData.playersNotGoing,
            updatedGameData.subTime
        );

        res.status(200).json(updatedGame.toObject());
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a game by ID
exports.deleteGame = async (req, res) => {
    try {
        const gameRef = db.collection('games').doc(req.params.id);
        await gameRef.delete();
        res.status(200).json({ message: "Game deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
