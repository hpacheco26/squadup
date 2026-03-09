const express = require('express');
const { 
    createGroupHandler, 
    getGroupsHandler, 
    getGroupByIdHandler, 
    updateGroupHandler, 
    deleteGroupHandler,
    getGroupsByPlayerHandler
} = require('../controllers/groupController');

const router = express.Router();

router.post('/', createGroupHandler);
router.get('/', getGroupsHandler);
router.get('/player/:playerId', getGroupsByPlayerHandler);
router.get('/:id', getGroupByIdHandler);
router.put('/:id', updateGroupHandler);
router.delete('/:id', deleteGroupHandler);

module.exports = router;
