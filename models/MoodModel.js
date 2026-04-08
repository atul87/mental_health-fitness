const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mood: { type: String, required: true },
  confidence: { type: Number },
  keywords: [{ type: String }],
  message: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Mood = mongoose.model('Mood', moodSchema);

// Create mood entry
async function createMoodEntry(moodData) {
  try {
    const newMood = new Mood(moodData);
    await newMood.save();
    return { insertedId: newMood._id };
  } catch (error) {
    console.error('Error creating mood entry:', error);
    throw error;
  }
}

// Get mood history for a user
async function getMoodHistory(userId) {
  try {
    return await Mood.find({ userId }).sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error fetching mood history:', error);
    throw error;
  }
}

// Get mood statistics for a user
async function getMoodStats(userId) {
  try {
    const userMoods = await Mood.find({ userId });
    
    // Get mood counts
    const moodCounts = {};
    userMoods.forEach(mood => {
      moodCounts[mood.mood] = (moodCounts[mood.mood] || 0) + 1;
    });
    
    // Get recent moods
    const recentMoods = await Mood.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);
      
    return { moodCounts, recentMoods };
  } catch (error) {
    console.error('Error fetching mood stats:', error);
    throw error;
  }
}

module.exports = {
  Mood,
  createMoodEntry,
  getMoodHistory,
  getMoodStats
};