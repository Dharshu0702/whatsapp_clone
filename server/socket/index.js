const User = require('../models/User');
const onlineUsers = new Map();

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    socket.on('setup', async (userId) => {
      if (!userId) return;

      socket.userId = userId;
      socket.join(userId);
      onlineUsers.set(userId, socket.id);

      try {
        await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
      } catch (err) {
        console.error('Error updating online status:', err);
      }

      socket.broadcast.emit('user-online', userId);

      socket.emit('online-users', Array.from(onlineUsers.keys()));

      console.log(` User ${userId} is online`);
    });

    socket.on('join-chat', (chatId) => {
      if (!chatId) return;
      socket.join(chatId);
      console.log(` User joined chat: ${chatId}`);
    });

    socket.on('leave-chat', (chatId) => {
      if (!chatId) return;
      socket.leave(chatId);
      console.log(` User left chat: ${chatId}`);
    });

    socket.on('new-message', (message) => {
      if (!message || !message.chat) return;

      const chatId = message.chat._id || message.chat;

      socket.to(chatId).emit('message-received', message);

      if (message.chat.participants) {
        message.chat.participants.forEach((participant) => {
          const participantId = participant._id || participant;
          if (participantId.toString() !== socket.userId) {
            socket.to(participantId.toString()).emit('chat-updated', message);
          }
        });
      }
    });

    socket.on('typing', ({ chatId, userId }) => {
      if (!chatId) return;
      socket.to(chatId).emit('typing', { chatId, userId });
    });

    socket.on('stop-typing', ({ chatId, userId }) => {
      if (!chatId) return;
      socket.to(chatId).emit('stop-typing', { chatId, userId });
    });

    socket.on('disconnect', async () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);

        try {
          await User.findByIdAndUpdate(socket.userId, {
            isOnline: false,
            lastSeen: new Date(),
          });
        } catch (err) {
          console.error('Error updating offline status:', err);
        }

        socket.broadcast.emit('user-offline', socket.userId);
        console.log(`👤 User ${socket.userId} went offline`);
      }

      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupSocket;
