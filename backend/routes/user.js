const express = require('express');
const User = require('../models/User');
const LoginLog = require('../models/LoginLog');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile.',
    });
  }
});

router.put('/profile', protect, async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile.',
    });
  }
});

router.get('/activity', protect, async (req, res) => {
  try {
    const logs = await LoginLog.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(20);

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity logs.',
    });
  }
});

module.exports = router;
