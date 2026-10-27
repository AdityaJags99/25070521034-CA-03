const Project = require('../models/Project');
const Application = require('../models/Application');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const notify = require('../utils/notify');
const { CATEGORIES } = require('../utils/constants');
const { escapeRegex, pageInfo, num, cleanList } = require('../utils/helpers');

const CLIENT_FIELDS = 'name company profilePicture location';

// Validates project fields. With partial=true only the fields that were sent are checked.
function checkFields(b, partial = false) {
  const errors = [];
  const check = (key) => !partial || b[key] !== undefined;

  if (check('title') && (!b.title || String(b.title).trim().length < 5)) errors.push('Title must be at least 5 characters');
  if (check('description') && (!b.description || String(b.description).trim().length < 20)) errors.push('Description must be at least 20 characters');
  if (check('category') && !CATEGORIES.includes(b.category)) errors.push('Please choose a valid category');
  if (check('requiredSkills') && cleanList(b.requiredSkills).length === 0) errors.push('Add at least one required skill');
  if (check('budget') && !(num(b.budget) > 0)) errors.push('Budget must be a number greater than 0');
  if (check('deadline')) {
    const d = new Date(b.deadline);
    if (!b.deadline || isNaN(d.getTime()) || d <= new Date()) errors.push('Deadline must be a valid future date');
  }
  if (errors.length) throw new AppError(errors.join('. '), 400);
}

// Finds a project and makes sure the logged-in client owns it.
async function getOwnedProject(req) {
  const project = await Project.findById(req.params.id);
  if (!project) throw new AppError('Project not found', 404);
  if (!project.clientId.equals(req.user._id)) throw new AppError('You can only manage your own projects', 403);
  return project;
}

// GET /api/projects  (public: search, filter, sort, paginate)
exports.list = asyncHandler(async (req, res) => {
  const { q, category, skill, sort, status } = req.query;
  const { page, limit, skip } = pageInfo(req, 9);
  const filter = { status: ['open', 'in-progress', 'completed', 'cancelled'].includes(status) ? status : 'open' };

  if (q) {
    const r = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ title: r }, { description: r }, { requiredSkills: r }];
  }
  if (category) filter.category = category;
  if (skill) filter.requiredSkills = new RegExp(`^${escapeRegex(skill)}$`, 'i');
  if (num(req.query.minBudget) !== undefined || num(req.query.maxBudget) !== undefined) {
    filter.budget = {};
    if (num(req.query.minBudget) !== undefined) filter.budget.$gte = num(req.query.minBudget);
    if (num(req.query.maxBudget) !== undefined) filter.budget.$lte = num(req.query.maxBudget);
  }

  const sorts = { newest: { createdAt: -1 }, 'budget-high': { budget: -1 }, 'budget-low': { budget: 1 }, deadline: { deadline: 1 } };
  const [projects, total] = await Promise.all([
    Project.find(filter).populate('clientId', CLIENT_FIELDS).sort(sorts[sort] || sorts.newest).skip(skip).limit(limit),
    Project.countDocuments(filter),
  ]);
  res.json({ projects, page, pages: Math.ceil(total / limit) || 1, total });
});

// GET /api/projects/mine  (client: own projects + application counts)
exports.mine = asyncHandler(async (req, res) => {
  const filter = { clientId: req.user._id };
  if (req.query.status) filter.status = req.query.status;
  const projects = await Project.find(filter)
    .populate('hiredFreelancerId', 'name headline profilePicture')
    .sort({ createdAt: -1 });

  const counts = await Application.aggregate([
    { $match: { projectId: { $in: projects.map((p) => p._id) } } },
    { $group: { _id: '$projectId', total: { $sum: 1 }, pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } } } },
  ]);
  const map = Object.fromEntries(counts.map((c) => [String(c._id), c]));
  const result = projects.map((p) => ({
    ...p.toObject(),
    applicationCount: map[String(p._id)]?.total || 0,
    pendingCount: map[String(p._id)]?.pending || 0,
  }));
  res.json({ projects: result });
});

// GET /api/projects/hired  (freelancer: projects they were hired for)
exports.hired = asyncHandler(async (req, res) => {
  const projects = await Project.find({ hiredFreelancerId: req.user._id })
    .populate('clientId', CLIENT_FIELDS)
    .sort({ updatedAt: -1 });
  res.json({ projects });
});

// GET /api/projects/:id
exports.getOne = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('clientId', CLIENT_FIELDS)
    .populate('hiredFreelancerId', 'name profilePicture');
  if (!project) throw new AppError('Project not found', 404);
  res.json({ project });
});

// POST /api/projects  (clients only)
exports.create = asyncHandler(async (req, res) => {
  checkFields(req.body);
  const b = req.body;
  const project = await Project.create({
    title: b.title, description: b.description, category: b.category,
    requiredSkills: cleanList(b.requiredSkills), budget: num(b.budget), deadline: b.deadline,
    clientId: req.user._id,
  });
  res.status(201).json({ project });
});

// PUT /api/projects/:id  (owner only: edit open projects, or change status)
exports.update = asyncHandler(async (req, res) => {
  const project = await getOwnedProject(req);
  const b = req.body;
  const contentKeys = ['title', 'description', 'category', 'requiredSkills', 'budget', 'deadline'];

  if (contentKeys.some((k) => b[k] !== undefined)) {
    if (project.status !== 'open') throw new AppError('Only open projects can be edited', 400);
    checkFields(b, true);
    contentKeys.forEach((k) => {
      if (b[k] === undefined) return;
      project[k] = k === 'requiredSkills' ? cleanList(b[k]) : k === 'budget' ? num(b[k]) : b[k];
    });
  }

  if (b.status && b.status !== project.status) {
    const allowed = { open: ['cancelled'], 'in-progress': ['completed', 'cancelled'] };
    if (!(allowed[project.status] || []).includes(b.status)) {
      throw new AppError(`A ${project.status} project cannot be changed to ${b.status}`, 400);
    }
    project.status = b.status;
    if (project.hiredFreelancerId) {
      notify(project.hiredFreelancerId, `Project "${project.title}" was marked ${b.status}.`, '/my-projects');
    }
  }

  await project.save();
  res.json({ project });
});

// DELETE /api/projects/:id  (owner only)
exports.remove = asyncHandler(async (req, res) => {
  const project = await getOwnedProject(req);
  if (project.status === 'in-progress') throw new AppError('Cancel or complete this project before deleting it', 400);
  await Application.deleteMany({ projectId: project._id });
  await project.deleteOne();
  res.json({ message: 'Project deleted' });
});

// GET /api/projects/:id/applications  (owner only)
exports.applications = asyncHandler(async (req, res) => {
  const project = await getOwnedProject(req);
  const applications = await Application.find({ projectId: project._id })
    .populate('freelancerId', 'name email headline skills hourlyRate experience profilePicture availability')
    .sort({ createdAt: -1 });
  res.json({ applications, project });
});
