const validator = require('validator');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { escapeRegex, pageInfo, num, cleanList } = require('../utils/helpers');

// GET /api/freelancers  (search, filters, sorting, pagination)
exports.list = asyncHandler(async (req, res) => {
  const { q, skill, availability, sort } = req.query;
  const { page, limit, skip } = pageInfo(req, 9);
  const filter = { role: 'freelancer' };

  if (q) {
    const r = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: r }, { headline: r }, { skills: r }, { bio: r }];
  }
  if (skill) filter.skills = new RegExp(`^${escapeRegex(skill)}$`, 'i');
  if (num(req.query.minRate) !== undefined || num(req.query.maxRate) !== undefined) {
    filter.hourlyRate = {};
    if (num(req.query.minRate) !== undefined) filter.hourlyRate.$gte = num(req.query.minRate);
    if (num(req.query.maxRate) !== undefined) filter.hourlyRate.$lte = num(req.query.maxRate);
  }
  if (num(req.query.minExp) !== undefined) filter.experience = { $gte: num(req.query.minExp) };
  if (['available', 'busy', 'unavailable'].includes(availability)) filter.availability = availability;

  const sorts = {
    newest: { createdAt: -1 },
    'rate-asc': { hourlyRate: 1 },
    'rate-desc': { hourlyRate: -1 },
    experience: { experience: -1 },
  };

  const [freelancers, total] = await Promise.all([
    User.find(filter).select('-email -education').sort(sorts[sort] || sorts.newest).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  res.json({ freelancers, page, pages: Math.ceil(total / limit) || 1, total });
});

// GET /api/freelancers/:id  (email is shown only to logged-in clients)
exports.getOne = asyncHandler(async (req, res) => {
  const isClient = req.user && req.user.role === 'client';
  const freelancer = await User.findOne({ _id: req.params.id, role: 'freelancer' }).select(isClient ? '' : '-email');
  if (!freelancer) throw new AppError('Freelancer not found', 404);
  res.json({ freelancer });
});

// PUT /api/freelancers/profile  (any logged-in user edits ONLY their own profile)
exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const b = req.body;

  const common = ['name', 'profilePicture', 'bio', 'location'];
  const freelancerOnly = ['headline', 'experience', 'education', 'hourlyRate', 'availability'];
  const allowed = [...common, ...(user.role === 'freelancer' ? freelancerOnly : ['company'])];
  allowed.forEach((key) => { if (b[key] !== undefined) user[key] = b[key]; });

  if (b.profilePicture && !validator.isURL(String(b.profilePicture), { require_protocol: true })) {
    throw new AppError('Profile picture must be a valid image URL (start with https://)', 400);
  }

  if (user.role === 'freelancer') {
    if (b.skills !== undefined) user.skills = cleanList(b.skills, 20);
    if (b.portfolio !== undefined) {
      if (!Array.isArray(b.portfolio)) throw new AppError('Portfolio must be a list', 400);
      const items = b.portfolio.filter((p) => p && p.url).slice(0, 10);
      for (const p of items) {
        if (!validator.isURL(String(p.url), { require_protocol: true })) {
          throw new AppError(`Invalid portfolio link: ${p.url} (must start with https://)`, 400);
        }
      }
      user.portfolio = items.map((p) => ({ title: String(p.title || 'Portfolio link').slice(0, 80), url: String(p.url) }));
    }
  }

  await user.save(); // runs schema validation
  res.json({ user });
});
