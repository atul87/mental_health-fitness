const express = require('express');
const { logExercise, getExerciseHistory, getExerciseStats } = require('../models/ExerciseModel');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/history', async (req, res) => {
  try {
    const history = await getExerciseHistory(req.userId);
    res.json({ success: true, history });
  } catch (error) {
    console.error('Error fetching exercise history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch exercise history' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const stats = await getExerciseStats(req.userId);
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching exercise stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch exercise stats' });
  }
});

router.post('/complete', async (req, res) => {
  try {
    const { exerciseId, title, category, durationMinutes } = req.body;

    if (!exerciseId || !title || !category || !durationMinutes) {
      return res.status(400).json({ success: false, error: 'All exercise fields are required' });
    }

    const savedExercise = await logExercise({
      userId: req.userId,
      exerciseId,
      title,
      category,
      durationMinutes
    });

    res.status(201).json({ success: true, exercise: savedExercise });
  } catch (error) {
    console.error('Error saving exercise:', error);
    res.status(500).json({ success: false, error: 'Failed to log exercise' });
  }
});

module.exports = router;
