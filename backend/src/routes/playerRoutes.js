const express = require('express');
const {
    createPlayerHandler,
    getAllPlayersHandler,
    getPlayerByIdHandler,
    getPlayerByUserIdHandler,
    updatePlayerHandler,
    deletePlayerHandler
} = require('../controllers/playerController');

const router = express.Router();

router.post('/', createPlayerHandler);
router.get('/', getAllPlayersHandler); 
router.get('/:id', getPlayerByIdHandler); 
router.get('/user/:userId', getPlayerByUserIdHandler); 
router.put('/:id', updatePlayerHandler); 
router.delete('/:id', deletePlayerHandler); 

module.exports = router;
