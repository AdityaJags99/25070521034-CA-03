const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const getToken = (req) => {
  const h = req.headers.authorization || '';
  return h.startsWith('Bearer ') ? h.split(' ')[1] : null;
};

// protect: user must be logged in. Puts the user on req.user.
exports.protect = asyncHandler(async (req, res, next) => {
  const token = getToken(req);
  if (!token) throw new AppError('Please log in to continue', 401);
  const decoded = jwt.verify(token, process.env.JWT_SECRET); // throws if invalid/expired
  const user = await User.findById(decoded.id);
  if (!user) throw new AppError('This account no longer exists', 401);
  req.user = user;
  next();
});

// optionalAuth: attaches req.user if a valid token exists, but never blocks.
exports.optionalAuth = asyncHandler(async (req, res, next) => {
  const token = getToken(req);
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    } catch (e) { /* ignore: treat as guest */ }
  }
  next();
});

// authorize('client'): only these roles may pass.
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError(`Only ${roles.join(' / ')} accounts can do this`, 403));
  }
  next();
};
