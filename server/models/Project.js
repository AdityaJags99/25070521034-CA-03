const mongoose = require('mongoose');
const { CATEGORIES } = require('../utils/constants');

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, minlength: [5, 'Title must be at least 5 characters'], maxlength: 120 },
    description: { type: String, required: [true, 'Description is required'], minlength: [20, 'Description must be at least 20 characters'], maxlength: 5000 },
    category: { type: String, required: [true, 'Category is required'], enum: { values: CATEGORIES, message: 'Invalid category' } },
    requiredSkills: { type: [String], validate: [(a) => a.length > 0, 'Add at least one required skill'] },
    budget: { type: Number, required: [true, 'Budget is required'], min: [1, 'Budget must be greater than 0'] },
    deadline: { type: Date, required: [true, 'Deadline is required'] },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    hiredFreelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: ['open', 'in-progress', 'completed', 'cancelled'], default: 'open' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
