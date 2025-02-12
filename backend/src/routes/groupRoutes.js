const express = require('express');
const { 
    createGroupHandler, 
    getGroupsHandler, 
    getGroupByIdHandler, 
    updateGroupHandler, 
    deleteGroupHandler,
    getGroupsByPlayerHandler,
    addPlayerToGroupHandler  
} = require('../controllers/groupController');

const router = express.Router();

router.post('/', createGroupHandler);
router.get('/', getGroupsHandler);
router.get('/:id', getGroupByIdHandler);
router.put('/:id', updateGroupHandler);
router.delete('/:id', deleteGroupHandler);
router.get('/player/:playerId', getGroupsByPlayerHandler);
router.post('/:groupId/player', addPlayerToGroupHandler); 

module.exports = router;
