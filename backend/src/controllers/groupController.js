const db = require('../config/firebase'); // Import Firestore database
const Group = require('../models/groupModel'); // Import Group class

// CREATE: Add a new group
const createGroupHandler = async (req, res) => {
    try {
        const { name, players = [], admin, adminId, sport } = req.body;

        if (!name || !Array.isArray(players) || !admin || !adminId || !sport) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // ✅ Format the document ID as "groupName-adminId" (removes spaces & converts to lowercase)
        const formattedId = `${name.replace(/\s+/g, '').toLowerCase()}-${adminId}`;

        // ✅ Create group instance (without an `id` field)
        const newGroup = new Group(name, players, admin, adminId, sport);

        // ✅ Save it using `set()` to ensure the custom ID is used
        await db.collection('groups').doc(formattedId).set(newGroup.toObject());

        res.status(201).json({ id: formattedId, ...newGroup.toObject() });

    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// READ: Get all groups
const getGroupsHandler = async (req, res) => {
    try {
        const snapshot = await db.collection('groups').get();
        const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return res.status(200).json(groups);
    } catch (error) {
        console.error('Error getting groups:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// READ: Get a single group by ID
const getGroupByIdHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection('groups').doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error('Error getting group:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// READ: Get all groups where the player is in the `players` array
const getGroupsByPlayerHandler = async (req, res) => {
    try {
        const { playerId } = req.params;

        if (!playerId) {
            return res.status(400).json({ error: 'Player ID is required' });
        }

        // Fetch all groups from Firestore
        const snapshot = await db.collection('groups').get();
        const groups = snapshot.docs
            .map(doc => ({ groupId: doc.id, ...doc.data() })) // Convert snapshot data
            .filter(group => group.players.some(player => player.id === playerId)); // Check if player exists in group

        // ✅ Always return a 200 response, even if no groups are found
        return res.status(200).json(groups);
        
    } catch (error) {
        console.error('Error getting groups by player:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// UPDATE: Modify an existing group
const updateGroupHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, players, admin, sport } = req.body;

        if (!name || !Array.isArray(players) || !admin || !sport) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const groupRef = db.collection('groups').doc(id);
        const groupDoc = await groupRef.get();

        if (!groupDoc.exists) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const updatedGroup = new Group(id, name, players, admin, sport);
        await groupRef.update(updatedGroup.toObject());

        res.status(200).json({ message: 'Group updated successfully' });
    } catch (error) {
        console.error('Error updating group:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// DELETE: Remove a group
const deleteGroupHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const groupRef = db.collection('groups').doc(id);
        const groupDoc = await groupRef.get();

        if (!groupDoc.exists) {
            return res.status(404).json({ error: 'Group not found' });
        }

        await groupRef.delete();
        res.status(200).json({ message: 'Group deleted successfully' });
    } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// ADD PLAYER TO GROUP: Add a player to the group
const addPlayerToGroupHandler = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { playerId, playerName } = req.body;

        if (!playerId || !playerName) {
            return res.status(400).json({ error: 'Player ID and name are required' });
        }

        const groupRef = db.collection('groups').doc(groupId);
        const groupDoc = await groupRef.get();

        if (!groupDoc.exists) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const group = groupDoc.data();
        // Add player to the group
        const updatedPlayers = [...group.players, { playerId, name: playerName }];

        // Update the group document with the new player
        await groupRef.update({ players: updatedPlayers });

        res.status(200).json({ message: 'Player added to group successfully', updatedPlayers });
    } catch (error) {
        console.error('Error adding player to group:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    createGroupHandler,
    getGroupsHandler,
    getGroupByIdHandler,
    getGroupsByPlayerHandler,
    updateGroupHandler,
    deleteGroupHandler,
    addPlayerToGroupHandler,
};
