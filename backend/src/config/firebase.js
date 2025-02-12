// src/config/firebase.js
const admin = require('firebase-admin');
const path = require('path');

// Load Firebase service account JSON file
const serviceAccount = require('./squadup-a3a55-firebase-adminsdk-4t0mu-622d224cb5.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://squadup-a3a55.firebaseio.com', // Replace with your Firebase Realtime Database URL if needed
});

// Firestore instance
const db = admin.firestore();

module.exports = db;
