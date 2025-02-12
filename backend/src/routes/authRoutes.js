// src/routes/authRoutes.js
const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

// Sign up a user (email/password)
router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    // Create user with email/password
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name, // Store name
    });
    
    // Respond with the user data
    res.status(201).json({ userId: userRecord.uid });
  } catch (error) {
    console.error('Error signing up user:', error);
    res.status(500).send('Error signing up user');
  }
});

// Login user with email/password
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    res.status(200).json({ userId: userRecord.uid, displayName: userRecord.displayName });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).send('Error logging in user');
  }
});

module.exports = router;
