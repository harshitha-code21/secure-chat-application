const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nacl = require('tweetnacl');

const router = express.Router();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Generate encryption key pair
    const keyPair = nacl.box.keyPair();

    // Create new user
    const user = new User({
      username,
      email,
      password,
      public_key: Buffer.from(keyPair.publicKey).toString('hex'),
      private_key: Buffer.from(keyPair.secretKey).toString('hex')
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { user_id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      user_id: user._id,
      token,
      message: 'User registered successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { user_id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      user_id: user._id,
      token,
      message: 'Login successful'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
