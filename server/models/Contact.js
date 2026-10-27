const mongoose = require('mongoose');

// Messages sent from the "Contact" form on the home page.
const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true },
    projectType: { type: String, default: 'Full App' },
    budgetRange: { type: String, default: '' },
    summary: { type: String, required: true, maxlength: 3000 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Contact', contactSchema);
