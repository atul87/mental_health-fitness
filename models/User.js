const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  avatar: { type: String },
  mood: { type: String, default: 'neutral' },
  streak: { type: Number, default: 0 },
  bio: {
    type: String,
    default: 'Mental wellness enthusiast focused on daily mindfulness and self-care.',
    trim: true
  },
  goals: {
    type: [String],
    default: ['Track mood daily', 'Practice meditation', 'Write in journal']
  },
  preferences: {
    notifications: { type: Boolean, default: true },
    publicProfile: { type: Boolean, default: false },
    shareProgress: { type: Boolean, default: true }
  },
  isAnonymous: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
