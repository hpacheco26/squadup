require('dotenv').config();
const app = require('./src/app');
const SERVER_CONFIG = require('./src/config/serverConfig');

app.listen(SERVER_CONFIG.PORT, () => {
    console.log(`Server is running on http://${SERVER_CONFIG.HOST}:${SERVER_CONFIG.PORT}`);
});