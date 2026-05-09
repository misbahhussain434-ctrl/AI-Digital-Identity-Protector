const mongoose = require('mongoose');

const securityAlertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'unauthorized_access',
      'failed_login',
      'account_locked',
      'brute_force_detected',
      'user_blocked',
      'user_unblocked',
    ],
    required: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  message: {
    type: String,
    required: true,
  },
  details: {
    ipAddress: String,
    userAgent: String,
    targetRoute: String,
    email: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    deviceInfo: {
      browser: String,
      os: String,
      device: String,
    },
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

securityAlertSchema.index({ timestamp: -1 });
securityAlertSchema.index({ type: 1, timestamp: -1 });
securityAlertSchema.index({ isRead: 1 });

module.exports = mongoose.model('SecurityAlert', securityAlertSchema);
