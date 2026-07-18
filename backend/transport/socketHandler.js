const { ChatRoomModel } = require('../models/chatRoomModel');

module.exports = function socketHandler(io) {
  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Join a specific room based on sessionId
    socket.on('join_room', async (data) => {
      const { sessionId, userId } = data;
      if (!sessionId) return;
      
      socket.join(sessionId);
      console.log(`Socket ${socket.id} joined room ${sessionId}`);

      // Try to find or create the room in DB
      try {
        let room = await ChatRoomModel.findOne({ sessionId });
        if (!room) {
          room = await ChatRoomModel.create({
            sessionId,
            user: userId || null,
            status: 'Active'
          });
          // Notify admin that a new room is created
          io.emit('admin_new_room', room);
        }
      } catch (err) {
        console.error('Error joining room:', err);
      }
    });

    // Handle sending message from User to Admin
    socket.on('send_message_to_admin', async (data) => {
      const { sessionId, text } = data;
      if (!sessionId || !text) return;

      try {
        const room = await ChatRoomModel.findOne({ sessionId });
        if (room) {
          const newMessage = { sender: 'User', text, timestamp: new Date() };
          room.messages.push(newMessage);
          room.unreadCountAdmin += 1;
          await room.save();

          // Broadcast to admin dashboard
          io.emit('admin_receive_message', { sessionId, message: newMessage });
          // Also broadcast back to user to confirm
          io.to(sessionId).emit('receive_message', newMessage);
        }
      } catch (err) {
        console.error('Error saving user message:', err);
      }
    });

    // Handle sending message from Admin to User
    socket.on('send_message_to_user', async (data) => {
      const { sessionId, text } = data;
      if (!sessionId || !text) return;

      try {
        const room = await ChatRoomModel.findOne({ sessionId });
        if (room) {
          const newMessage = { sender: 'Agent', text, timestamp: new Date() };
          room.messages.push(newMessage);
          room.unreadCountUser += 1;
          await room.save();

          // Broadcast to the user in the room
          io.to(sessionId).emit('receive_message', newMessage);
          // Broadcast to admin to confirm
          io.emit('admin_receive_message', { sessionId, message: newMessage });
        }
      } catch (err) {
        console.error('Error saving admin message:', err);
      }
    });

    // Admin mark messages as read
    socket.on('admin_mark_read', async (data) => {
      const { sessionId } = data;
      try {
        await ChatRoomModel.updateOne({ sessionId }, { unreadCountAdmin: 0 });
      } catch (err) {
        console.error('Error marking read:', err);
      }
    });

    // User mark messages as read
    socket.on('user_mark_read', async (data) => {
      const { sessionId } = data;
      try {
        await ChatRoomModel.updateOne({ sessionId }, { unreadCountUser: 0 });
      } catch (err) {
        console.error('Error marking read:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};
