const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SecurityAlert = require('../models/SecurityAlert');
const { parseDevice } = require('../utils/deviceParser');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    const deviceInfo = parseDevice(req.headers['user-agent']);

    await SecurityAlert.create({
      type: 'unauthorized_access',
      severity: 'medium',
      message: `Unauthorized access attempt to ${req.originalUrl}`,
      details: {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        targetRoute: req.originalUrl,
        deviceInfo,
      },
    });

    return res.status(401).json({
      success: false,
      message: 'Unauthorized access detected. Please log in.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.',
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Contact an administrator.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
  }
  next();
};

module.exports = { protect, adminOnly };
