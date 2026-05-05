const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  message_id: {
    type: String,
    required: true,
    unique: true
  },
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  room_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  encrypted_content: {
    type: String,
    required: true
  },
  nonce: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  },
  is_read: {
    type: Boolean,
    default: false
  },
  edit_history: [{
    content: String,
    edited_at: Date
  }]
});

// Index for efficient querying
messageSchema.index({ room_id: 1, created_at: -1 });
messageSchema.index({ sender_id: 1, created_at: -1 });

module.exports = mongoose.model('Message', messageSchema);
