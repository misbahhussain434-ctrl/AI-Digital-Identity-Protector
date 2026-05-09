const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const LoginLog = require('../models/LoginLog');
const SecurityAlert = require('../models/SecurityAlert');
const { registerValidation, loginValidation } = require('../middleware/validation');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');
const { parseDevice } = require('../utils/deviceParser');

const router = express.Router();

const generateToken = (id, rememberMe = false) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: rememberMe ? '30d' : (process.env.JWT_EXPIRES_IN || '7d'),
  });
};

router.post('/register', registerLimiter, registerValidation, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const deviceInfo = parseDevice(req.headers['user-agent']);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const user = await User.create({ name, email, password });

    await LoginLog.create({
      userId: user._id,
      email: user.email,
      action: 'register',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      deviceInfo,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
    });
  }
});

router.post('/login', loginLimiter, loginValidation, async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    const deviceInfo = parseDevice(req.headers['user-agent']);

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      await LoginLog.create({
        email,
        action: 'login_failed',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        deviceInfo,
      });

      await SecurityAlert.create({
        type: 'failed_login',
        severity: 'low',
        message: `Failed login attempt for non-existent account: ${email}`,
        details: {
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          email,
          deviceInfo,
        },
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Contact an administrator.',
      });
    }

    if (user.isLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Account temporarily locked due to multiple failed attempts. Try again later.',
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      user.failedLoginAttempts += 1;
      user.lastFailedLogin = new Date();

      const maxAttempts = parseInt(process.env.FAILED_LOGIN_ALERT_THRESHOLD, 10) || 5;

      if (user.failedLoginAttempts >= maxAttempts) {
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000);

        await SecurityAlert.create({
          type: 'account_locked',
          severity: 'high',
          message: `Account locked after ${user.failedLoginAttempts} failed attempts: ${email}`,
          details: {
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            email,
            userId: user._id,
            deviceInfo,
          },
        });

        await SecurityAlert.create({
          type: 'brute_force_detected',
          severity: 'critical',
          message: `Possible brute force attack detected on account: ${email}`,
          details: {
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            email,
            userId: user._id,
            deviceInfo,
          },
        });
      } else {
        await SecurityAlert.create({
          type: 'failed_login',
          severity: user.failedLoginAttempts >= 3 ? 'medium' : 'low',
          message: `Failed login attempt ${user.failedLoginAttempts} for: ${email}`,
          details: {
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            email,
            userId: user._id,
            deviceInfo,
          },
        });
      }

      await user.save();

      await LoginLog.create({
        userId: user._id,
        email,
        action: 'login_failed',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        deviceInfo,
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    await user.save();

    await LoginLog.create({
      userId: user._id,
      email: user.email,
      action: 'login_success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      deviceInfo,
    });

    const token = generateToken(user._id, rememberMe);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
    });
  }
});

router.post('/logout', async (req, res) => {
  try {
    let token = req.headers.authorization;
    if (token && token.startsWith('Bearer')) {
      token = token.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const deviceInfo = parseDevice(req.headers['user-agent']);

      await LoginLog.create({
        userId: decoded.id,
        email: 'N/A',
        action: 'logout',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        deviceInfo,
      });
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }
});

module.exports = router;
