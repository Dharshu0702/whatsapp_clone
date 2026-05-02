const express = require('express');
const Chat = require('../models/Chat');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();


router.post('/', auth, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required to create a chat' });
    }

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot create a chat with yourself' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    let existingChat = await Chat.findOne({
      participants: { $all: [req.user._id, userId], $size: 2 },
    })
      .populate('participants', '-password')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'username avatar' },
      });

    if (existingChat) {
      console.log(`[CHAT EXISTS] id=${existingChat._id} participants=[${existingChat.participants.map(p => p.username).join(', ')}]`);
      return res.json(existingChat);
    }

    const newChat = await Chat.create({
      participants: [req.user._id, userId],
    });

    console.log(`[CHAT CREATED] id=${newChat._id} participants=[${req.user._id}, ${userId}]`);

    const fullChat = await Chat.findById(newChat._id).populate(
      'participants',
      '-password'
    );

    res.status(201).json(fullChat);
  } catch (error) {
    console.error('Create chat error:', error.message, error.stack);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({ message: 'Server error creating chat' });
  }
});


router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
    })
      .populate('participants', '-password')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'username avatar' },
      })
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: 'Server error fetching chats' });
  }
});

module.exports = router;
