const bcrypt = require('bcryptjs');
const validator = require('validator');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    throw new AppError('Name, email, password and account type are required', 400);
  }
  if (!validator.isEmail(String(email))) throw new AppError('Please enter a valid email address', 400);
  if (String(password).length < 6) throw new AppError('Password must be at least 6 characters', 400);
  if (!['freelancer', 'client'].includes(role)) throw new AppError('Account type must be freelancer or client', 400);

  const exists = await User.findOne({ email: String(email).toLowerCase() });
  if (exists) throw new AppError('An account with this email already exists', 409);

  const passwordHash = await bcrypt.hash(String(password), 10); // never store the plain password
  const user = await User.create({ name: String(name), email: String(email), passwordHash, role });
  res.status(201).json({ token: generateToken(user._id), user });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError('Email and password are required', 400);

  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+passwordHash');
  const ok = user && (await bcrypt.compare(String(password), user.passwordHash));
  if (!ok) throw new AppError('Invalid email or password', 401);

  res.json({ token: generateToken(user._id), user });
});

// GET /api/auth/me
exports.me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
