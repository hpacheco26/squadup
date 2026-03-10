// src/routes/authRoutes.js
const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

// Verify a Firebase ID token (used by frontend after client-side auth)
router.post('/verify', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    res.status(200).json({ uid: decodedToken.uid, email: decodedToken.email });
  } catch (error) {
    console.error('Token verification error:', error.message);
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
