const express = require('express');
const cors = require('cors');
const groupRoutes = require('./routes/groupRoutes'); 
const playerRoutes = require('./routes/playerRoutes'); 
const gameRoutes = require('./routes/gameRoutes');
const SERVER_CONFIG = require('./config/serverConfig');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/groups', groupRoutes);
app.use('/api/players', playerRoutes); 
app.use('/api/games', gameRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the Player Grouping System!');
});

module.exports = app;