const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const groupRoutes = require('./routes/groupRoutes'); 
const playerRoutes = require('./routes/playerRoutes'); 
const gameRoutes = require('./routes/gameRoutes');
const authRoutes = require('./routes/authRoutes');
const authenticate = require('./middlewares/authenticate');

const app = express();

// CORS — restrict to frontend origin
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use(morgan('dev'));

// Public routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to SquadUp API');
});

// Protected routes — require valid Firebase token
app.use('/api/groups', authenticate, groupRoutes);
app.use('/api/players', authenticate, playerRoutes); 
app.use('/api/games', authenticate, gameRoutes);

// Global error handler
app.use((err, req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;