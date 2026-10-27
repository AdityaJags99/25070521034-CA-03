const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: [80, 'Name is too long'] },
    email: {
      type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true,
      validate: [validator.isEmail, 'Please enter a valid email address'],
    },
    passwordHash: { type: String, required: true, select: false }, // never returned by default
    role: { type: String, enum: ['freelancer', 'client'], required: true },
    profilePicture: { type: String, default: '' },
    headline: { type: String, default: '', maxlength: 120 },
    bio: { type: String, default: '', maxlength: [1500, 'Bio is too long'] },
    skills: [{ type: String, trim: true }],
    experience: { type: Number, default: 0, min: 0, max: 60 }, // years
    education: { type: String, default: '', maxlength: 300 },
    portfolio: [{ title: String, url: String }],
    hourlyRate: { type: Number, default: 0, min: [0, 'Hourly rate cannot be negative'] },
    availability: { type: String, enum: ['available', 'busy', 'unavailable'], default: 'available' },
    company: { type: String, default: '', maxlength: 100 }, // clients
    location: { type: String, default: '', maxlength: 100 },
  },
  { timestamps: true }
);

// Safety net: the password hash can never leave the server inside JSON.
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
