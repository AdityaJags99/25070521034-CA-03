const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    proposal: { type: String, required: [true, 'Proposal is required'], minlength: [20, 'Proposal must be at least 20 characters'], maxlength: 3000 },
    proposedBudget: { type: Number, required: [true, 'Expected price is required'], min: [1, 'Expected price must be greater than 0'] },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

// One freelancer can apply to one project only once (database-level protection).
applicationSchema.index({ projectId: 1, freelancerId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
