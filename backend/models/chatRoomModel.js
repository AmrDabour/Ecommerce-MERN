const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['User', 'Agent'],
    required: true
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatRoomSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    default: null // Can be null if it's a guest session (we can use sessionId instead)
  },
  sessionId: {
    type: String,
    required: true,
    unique: true // Ensure one active room per session
  },
  messages: [messageSchema],
  status: {
    type: String,
    enum: ['Active', 'Closed'],
    default: 'Active'
  },
  unreadCountAdmin: {
    type: Number,
    default: 0
  },
  unreadCountUser: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const ChatRoomModel = mongoose.model('ChatRoom', chatRoomSchema);

module.exports = { ChatRoomModel };
