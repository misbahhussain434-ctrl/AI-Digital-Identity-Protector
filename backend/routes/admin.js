const express = require('express');
const User = require('../models/User');
const LoginLog = require('../models/LoginLog');
const SecurityAlert = require('../models/SecurityAlert');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.json({
      success: true,
      data: {
        users,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
});

router.get('/login-logs', protect, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.action) filter.action = req.query.action;

    const logs = await LoginLog.find(filter)
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await LoginLog.countDocuments(filter);

    res.json({
      success: true,
      data: {
        logs,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch login logs.' });
  }
});

router.get('/alerts', protect, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.severity) filter.severity = req.query.severity;

    const alerts = await SecurityAlert.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SecurityAlert.countDocuments(filter);
    const unreadCount = await SecurityAlert.countDocuments({ isRead: false });

    res.json({
      success: true,
      data: {
        alerts,
        unreadCount,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch alerts.' });
  }
});

router.patch('/alerts/:id/read', protect, adminOnly, async (req, res) => {
  try {
    await SecurityAlert.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true, message: 'Alert marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update alert.' });
  }
});

router.patch('/alerts/read-all', protect, adminOnly, async (req, res) => {
  try {
    await SecurityAlert.updateMany({ isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All alerts marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update alerts.' });
  }
});

router.patch('/users/:id/block', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot block admin users.' });
    }

    user.isBlocked = true;
    await user.save();

    await SecurityAlert.create({
      type: 'user_blocked',
      severity: 'medium',
      message: `User ${user.email} has been blocked by admin`,
      details: { userId: user._id, email: user.email },
    });

    res.json({ success: true, message: `User ${user.email} has been blocked.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to block user.' });
  }
});

router.patch('/users/:id/unblock', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.isBlocked = false;
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    await SecurityAlert.create({
      type: 'user_unblocked',
      severity: 'low',
      message: `User ${user.email} has been unblocked by admin`,
      details: { userId: user._id, email: user.email },
    });

    res.json({ success: true, message: `User ${user.email} has been unblocked.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to unblock user.' });
  }
});

router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const blockedUsers = await User.countDocuments({ isBlocked: true });
    const totalLogins = await LoginLog.countDocuments({ action: 'login_success' });
    const failedLogins = await LoginLog.countDocuments({ action: 'login_failed' });
    const totalAlerts = await SecurityAlert.countDocuments();
    const unreadAlerts = await SecurityAlert.countDocuments({ isRead: false });
    const criticalAlerts = await SecurityAlert.countDocuments({ severity: 'critical' });

    const recentLogins = await LoginLog.find({ action: 'login_success' })
      .sort({ timestamp: -1 })
      .limit(5)
      .populate('userId', 'name email');

    res.json({
      success: true,
      data: {
        totalUsers,
        blockedUsers,
        totalLogins,
        failedLogins,
        totalAlerts,
        unreadAlerts,
        criticalAlerts,
        recentLogins,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats.' });
  }
});

module.exports = router;
