const { ChatRoomModel } = require('../models/chatRoomModel');
const { UserModel } = require('../models/userModel');

// Fetch all active chat rooms (for Admin)
async function getActiveRooms(req, res) {
  try {
    const rooms = await ChatRoomModel.find().populate('user', 'name email').sort('-updatedAt');
    res.status(200).json({ rooms });
  } catch (error) {
    console.error('Error fetching active rooms:', error);
    res.status(500).json({ msg: 'Failed to fetch rooms', error });
  }
}

// Fetch chat history for a specific session
async function getChatHistory(req, res) {
  try {
    const { sessionId } = req.params;
    const room = await ChatRoomModel.findOne({ sessionId });
    if (!room) {
      return res.status(200).json({ messages: [], status: 'Active', unreadCountUser: 0, unreadCountAdmin: 0 });
    }
    res.status(200).json({ 
      messages: room.messages, 
      status: room.status,
      unreadCountUser: room.unreadCountUser,
      unreadCountAdmin: room.unreadCountAdmin
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ msg: 'Failed to fetch history', error });
  }
}

// Close a chat session (Admin only)
async function closeChat(req, res) {
  try {
    const { sessionId } = req.params;
    const room = await ChatRoomModel.findOneAndUpdate(
      { sessionId }, 
      { status: 'Closed' },
      { new: true }
    );
    res.status(200).json({ msg: 'Chat closed successfully', room });
  } catch (error) {
    console.error('Error closing chat:', error);
    res.status(500).json({ msg: 'Failed to close chat', error });
  }
}

module.exports = { getActiveRooms, getChatHistory, closeChat };
