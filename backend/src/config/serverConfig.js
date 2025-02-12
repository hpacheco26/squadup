require('dotenv').config();

const SERVER_CONFIG = {
    PORT: process.env.PORT || 3000,
    HOST: process.env.HOST || 'localhost'
};

module.exports = SERVER_CONFIG;