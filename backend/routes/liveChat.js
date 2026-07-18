const express = require('express');
const { getActiveRooms, getChatHistory, closeChat } = require('../controller/liveChat');
const { isAuth } = require('../middleware/isAuth');

// Middleware to check admin role
const allowedTo = (role) => {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      res.status(403).json({ msg: 'Forbidden: Insufficient privileges' });
    }
  };
};

const router = express.Router();

// Get active rooms (Admin only)
router.get('/rooms', isAuth, allowedTo('admin'), getActiveRooms);

// Get specific chat history
router.get('/:sessionId', getChatHistory);

// Close chat session (Admin only)
router.patch('/:sessionId/close', isAuth, allowedTo('admin'), closeChat);

module.exports = router;
