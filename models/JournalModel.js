const mongoose = require('mongoose');

const JournalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  mood: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  tags: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Journal = mongoose.model('Journal', JournalSchema);

// Helper functions for easy import
const createJournalEntry = async (data) => {
  const entry = new Journal(data);
  return await entry.save();
};

const getJournalEntries = async (userId) => {
  return await Journal.find({ userId }).sort({ createdAt: -1 });
};

const updateJournalEntry = async (id, userId, data) => {
  return await Journal.findOneAndUpdate(
    { _id: id, userId },
    data,
    { returnDocument: 'after', runValidators: true }
  );
};

const deleteJournalEntry = async (id, userId) => {
  return await Journal.findOneAndDelete({ _id: id, userId });
};

module.exports = {
  Journal,
  createJournalEntry,
  getJournalEntries,
  updateJournalEntry,
  deleteJournalEntry
};
