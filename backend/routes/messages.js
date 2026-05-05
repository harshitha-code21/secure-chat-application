const express = require('express');
const Message = require('../models/Message');
const authMiddleware = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Send message
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { room_id, encrypted_content, nonce } = req.body;

    if (!room_id || !encrypted_content || !nonce) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const message = new Message({
      message_id: uuidv4(),
      sender_id: req.user.user_id,
      room_id,
      encrypted_content,
      nonce
    });

    await message.save();
    res.status(201).json({
      message_id: message.message_id,
      created_at: message.created_at
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages from a room
router.get('/:room_id', authMiddleware, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const messages = await Message.find({ room_id: req.params.room_id })
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .populate('sender_id', 'username');
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
