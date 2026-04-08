const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exerciseId: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  durationMinutes: {
    type: Number,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

const ExerciseHistory = mongoose.model('ExerciseHistory', ExerciseSchema);

// Helper functions
const logExercise = async (data) => {
  const exercise = new ExerciseHistory(data);
  return await exercise.save();
};

const getExerciseHistory = async (userId) => {
  return await ExerciseHistory.find({ userId }).sort({ completedAt: -1 });
};

const getExerciseStats = async (userId) => {
  const history = await ExerciseHistory.find({ userId });
  return {
    totalSessions: history.length,
    totalMinutes: history.reduce((acc, curr) => acc + curr.durationMinutes, 0)
  };
};

module.exports = {
  ExerciseHistory,
  logExercise,
  getExerciseHistory,
  getExerciseStats
};
