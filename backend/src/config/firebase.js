// src/config/firebase.js
const admin = require('firebase-admin');
const path = require('path');

// Load Firebase service account from env var path or default location
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    || path.join(__dirname, 'squadup-a3a55-firebase-adminsdk-4t0mu-e1e026238f.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://squadup-a3a55.firebaseio.com',
});

// Firestore instance
const db = admin.firestore();

module.exports = db;
