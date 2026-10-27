const Application = require('../models/Application');
const Project = require('../models/Project');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const notify = require('../utils/notify');
const { pageInfo, num } = require('../utils/helpers');

// POST /api/applications  (freelancers only)
exports.create = asyncHandler(async (req, res) => {
  const { projectId, proposal, proposedBudget } = req.body;
  if (!projectId) throw new AppError('projectId is required', 400);
  if (!proposal || String(proposal).length < 20) throw new AppError('Proposal must be at least 20 characters', 400);
  if (!(num(proposedBudget) > 0)) throw new AppError('Expected price must be a number greater than 0', 400);

  const project = await Project.findById(projectId);
  if (!project) throw new AppError('Project not found', 404);
  if (project.status !== 'open') throw new AppError('This project is no longer accepting applications', 400);

  const already = await Application.findOne({ projectId, freelancerId: req.user._id });
  if (already) throw new AppError('You have already applied to this project', 409);

  const application = await Application.create({
    projectId, freelancerId: req.user._id, proposal, proposedBudget: num(proposedBudget),
  });
  notify(project.clientId, `${req.user.name} applied to "${project.title}".`, `/projects/${project._id}/applications`);
  res.status(201).json({ application });
});

// GET /api/applications/my  (freelancer's own applications)
exports.my = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pageInfo(req, 20);
  const filter = { freelancerId: req.user._id };
  if (['pending', 'accepted', 'rejected'].includes(req.query.status)) filter.status = req.query.status;

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate({ path: 'projectId', select: 'title budget status category deadline clientId', populate: { path: 'clientId', select: 'name company' } })
      .sort({ createdAt: -1 }).skip(skip).limit(limit),
    Application.countDocuments(filter),
  ]);
  res.json({ applications, page, pages: Math.ceil(total / limit) || 1, total });
});

// PATCH /api/applications/:id/status  (project owner accepts or rejects)
exports.updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['accepted', 'rejected'].includes(status)) throw new AppError('Status must be accepted or rejected', 400);

  const application = await Application.findById(req.params.id);
  if (!application) throw new AppError('Application not found', 404);
  const project = await Project.findById(application.projectId);
  if (!project) throw new AppError('Project not found', 404);
  if (!project.clientId.equals(req.user._id)) throw new AppError('You can only manage applications for your own projects', 403);
  if (application.status !== 'pending') throw new AppError(`This application was already ${application.status}`, 400);

  if (status === 'accepted') {
    if (project.status !== 'open') throw new AppError('This project already has a hired freelancer', 400);
    application.status = 'accepted';
    project.status = 'in-progress';
    project.hiredFreelancerId = application.freelancerId;
    await application.save();
    await project.save();

    // Reject every other pending application for this project
    const others = await Application.find({ projectId: project._id, status: 'pending', _id: { $ne: application._id } });
    await Application.updateMany({ _id: { $in: others.map((o) => o._id) } }, { status: 'rejected' });
    notify(application.freelancerId, `You were hired for "${project.title}"! 🎉`, '/my-projects');
    others.forEach((o) => notify(o.freelancerId, `"${project.title}" went to another freelancer.`, '/my-applications'));
  } else {
    application.status = 'rejected';
    await application.save();
    notify(application.freelancerId, `Your application for "${project.title}" was not selected.`, '/my-applications');
  }
  res.json({ application, project });
});
