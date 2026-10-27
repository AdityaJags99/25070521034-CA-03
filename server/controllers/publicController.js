const validator = require('validator');
const User = require('../models/User');
const Project = require('../models/Project');
const Application = require('../models/Application');
const Contact = require('../models/Contact');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/stats  (numbers shown on the home page, straight from MongoDB)
exports.stats = asyncHandler(async (req, res) => {
  const [freelancers, clients, openProjects, completedProjects, applications, categories] = await Promise.all([
    User.countDocuments({ role: 'freelancer' }),
    User.countDocuments({ role: 'client' }),
    Project.countDocuments({ status: 'open' }),
    Project.countDocuments({ status: 'completed' }),
    Application.countDocuments(),
    Project.aggregate([{ $match: { status: 'open' } }, { $group: { _id: '$category', count: { $sum: 1 } } }]),
  ]);
  res.json({
    freelancers, clients, openProjects, completedProjects, applications,
    categories: categories.map((c) => ({ name: c._id, count: c.count })),
  });
});

// POST /api/contact  (home page contact form)
exports.contact = asyncHandler(async (req, res) => {
  const { name, email, projectType, budgetRange, summary } = req.body;
  if (!name || !email || !summary) throw new AppError('Name, email and project summary are required', 400);
  if (!validator.isEmail(String(email))) throw new AppError('Please enter a valid email address', 400);
  await Contact.create({ name, email, projectType, budgetRange, summary });
  res.status(201).json({ message: 'Thanks! We will reply within 12 hours.' });
});
