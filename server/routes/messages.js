const express = require('express');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { chatId, content } = req.body;

    if (!chatId || !content) {
      return res.status(400).json({ message: 'chatId and content are required' });
    }

    if (!content.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const isParticipant = chat.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to send messages in this chat' });
    }

    const messageDoc = await Message.create({
      chat: chatId,
      sender: req.user._id,
      content: content.trim(),
      readBy: [req.user._id],
    });

    console.log(`[MSG SAVED] id=${messageDoc._id} content="${content.trim().substring(0, 30)}" sender=${req.user._id}`);

    let message = await Message.findById(messageDoc._id)
      .populate('sender', 'username avatar')
      .populate('chat');

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id,
      updatedAt: Date.now(),
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error.message, error.stack);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid chat ID' });
    }
    res.status(500).json({ message: 'Server error sending message' });
  }
});

router.get('/:chatId', auth, async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const isParticipant = chat.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to view this chat' });
    }

    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid chat ID' });
    }
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
});

module.exports = router;
