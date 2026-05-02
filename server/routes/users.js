const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('-password')
      .sort({ username: 1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { username, status, profilePicture } = req.body;
    const updates = {};

    if (username && username.trim()) {
      const existing = await User.findOne({
        username: username.trim(),
        _id: { $ne: req.user._id },
      });
      if (existing) return res.status(400).json({ message: 'Username already taken' });
      updates.username = username.trim();
      updates.avatar = username.trim().charAt(0).toUpperCase();
    }

    if (status !== undefined) {
      updates.status = status.trim().substring(0, 140);
    }

    if (profilePicture !== undefined) {
      if (profilePicture && !profilePicture.startsWith('data:image/')) {
        return res.status(400).json({ message: 'Invalid image format' });
      }
      updates.profilePicture = profilePicture;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

router.delete('/profile/picture', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { profilePicture: '' } },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Delete picture error:', error);
    res.status(500).json({ message: 'Server error deleting profile picture' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error fetching user' });
  }
});

module.exports = router;
