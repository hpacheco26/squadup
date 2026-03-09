const express = require('express');
const { 
    createGameHandler,
    getAllGamesHandler,
    getGameByIdHandler,
    getGamesByGroupHandler,
    updateGameHandler,
    deleteGameHandler
 } = require('../controllers/gameController');

const router = express.Router();

router.post('/', createGameHandler);
router.get('/', getAllGamesHandler);
router.get('/group/:groupId', getGamesByGroupHandler);
router.get('/:id', getGameByIdHandler);
router.put('/:id', updateGameHandler);
router.delete('/:id', deleteGameHandler);

module.exports = router;
