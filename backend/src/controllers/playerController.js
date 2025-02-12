const db = require('../config/firebase'); // Import Firestore database
const Player = require('../models/playerModel'); // Import Player class

/** 
 * CREATE PLAYER - Adds a new player to Firestore
 * @route POST /api/players
 */
const createPlayerHandler = async (req, res) => {
    try {
        const { id, firstName, lastName, userId, groups = [] } = req.body;

        if (!id || !firstName || !lastName || !userId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create a new Player instance
        const newPlayer = new Player(id, firstName, lastName, userId, groups);

        // Store player in Firestore
        await db.collection('players').doc(id).set({ ...newPlayer });

        return res.status(201).json({ message: 'Player created successfully', player: newPlayer });
    } catch (error) {
        console.error('Error creating player:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

/** 
 * GET ALL PLAYERS - Retrieves all players from Firestore
 * @route GET /api/players
 */
const getAllPlayersHandler = async (req, res) => {
    try {
        const snapshot = await db.collection('players').get();
        const players = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return res.status(200).json(players);
    } catch (error) {
        console.error('Error getting players:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

/** 
 * GET PLAYER BY ID - Retrieves a single player by ID
 * @route GET /api/players/:id
 */
const getPlayerByIdHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const playerDoc = await db.collection('players').doc(id).get();

        if (!playerDoc.exists) {
            return res.status(404).json({ error: 'Player not found' });
        }

        return res.status(200).json({ id: playerDoc.id, ...playerDoc.data() });
    } catch (error) {
        console.error('Error getting player:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

/** 
 * GET PLAYER BY USERID - Retrieves a player by userId
 * @route GET /api/players/user/:userId
 */
const getPlayerByUserIdHandler = async (req, res) => {
    try {
        const { userId } = req.params;
        const snapshot = await db.collection('players').where("userId", "==", userId).get();

        if (snapshot.empty) {
            return res.status(200).json(null); // Return null instead of 404 if no player found
        }

        const playerData = snapshot.docs[0].data();
        return res.status(200).json({ id: snapshot.docs[0].id, ...playerData });
    } catch (error) {
        console.error('Error getting player by userId:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

/** 
 * UPDATE PLAYER - Updates a player's details
 * @route PUT /api/players/:id
 */
const updatePlayerHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, groups, userId } = req.body;

        const playerDoc = await db.collection('players').doc(id).get();
        if (!playerDoc.exists) {
            return res.status(404).json({ error: 'Player not found' });
        }

        const updatedData = {};
        if (firstName) updatedData.firstName = firstName;
        if (lastName) updatedData.lastName = lastName;
        if (groups) updatedData.groups = groups;
        if (userId) updatedData.userId = userId;

        await db.collection('players').doc(id).update(updatedData);

        return res.status(200).json({ message: 'Player updated successfully' });
    } catch (error) {
        console.error('Error updating player:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

/** 
 * DELETE PLAYER - Removes a player from Firestore
 * @route DELETE /api/players/:id
 */
const deletePlayerHandler = async (req, res) => {
    try {
        const { id } = req.params;

        const playerDoc = await db.collection('players').doc(id).get();
        if (!playerDoc.exists) {
            return res.status(404).json({ error: 'Player not found' });
        }

        await db.collection('players').doc(id).delete();
        return res.status(200).json({ message: 'Player deleted successfully' });
    } catch (error) {
        console.error('Error deleting player:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    createPlayerHandler,
    getAllPlayersHandler,
    getPlayerByIdHandler,
    getPlayerByUserIdHandler, 
    updatePlayerHandler,
    deletePlayerHandler
};
