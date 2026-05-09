const mongoose = require('mongoose');

const loginLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  email: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    enum: ['login_success', 'login_failed', 'logout', 'register'],
    required: true,
  },
  ipAddress: {
    type: String,
    default: 'unknown',
  },
  userAgent: {
    type: String,
    default: 'unknown',
  },
  deviceInfo: {
    browser: String,
    os: String,
    device: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

loginLogSchema.index({ timestamp: -1 });
loginLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('LoginLog', loginLogSchema);
