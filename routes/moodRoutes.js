const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createMoodEntry, getMoodHistory, getMoodStats } = require('../models/MoodModel');
const { protect } = require('../middleware/auth');

const router = express.Router();

let genAI = null;
let model = null;

const initializeGemini = () => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Gemini API key not found. Mood analysis will use offline mode.');
      return false;
    }

    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    return true;
  } catch (error) {
    console.error('Error initializing Gemini:', error);
    return false;
  }
};

const moodAnalysisPrompt = (message) => `
Analyze the user's mood based on this message.

Return ONLY this JSON format:
{
  "mood": "Very Positive | Positive | Neutral | Negative | Very Negative",
  "confidence": "0-1",
  "keywords": ["main feelings"]
}

Message: "${message}"
`;

router.use(protect);

router.post('/analyze', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    let text = '';
    if (!model && !initializeGemini()) {
      text = '{"mood": "Neutral", "confidence": "0.5", "keywords": ["calm", "offline"]}';
    } else {
      try {
        const prompt = moodAnalysisPrompt(message);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        text = response.text();
      } catch (geminiError) {
        console.warn('Google AI API rejected mood analysis. Falling back to neutral.', geminiError.message);
        text = '{"mood": "Neutral", "confidence": "0.5", "keywords": ["calm", "offline fallback"]}';
      }
    }

    let moodAnalysis;
    try {
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      const jsonString = text.substring(jsonStart, jsonEnd);
      moodAnalysis = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Error parsing mood analysis response:', parseError);
      moodAnalysis = { mood: 'Neutral', confidence: 0.5, keywords: ['fallback'] };
    }

    const savedMood = await createMoodEntry({
      userId: req.userId,
      mood: moodAnalysis.mood,
      confidence: parseFloat(moodAnalysis.confidence),
      keywords: moodAnalysis.keywords,
      message
    });

    res.json({
      success: true,
      mood: moodAnalysis,
      id: savedMood.insertedId
    });
  } catch (error) {
    console.error('Error in mood analysis:', error);
    res.status(500).json({ success: false, error: 'Failed to analyze mood', details: error.message });
  }
});

router.get('/history', async (req, res) => {
  try {
    const moodHistory = await getMoodHistory(req.userId);
    res.json({ success: true, moods: moodHistory });
  } catch (error) {
    console.error('Error fetching mood history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch mood history' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const stats = await getMoodStats(req.userId);
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching mood stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch mood stats' });
  }
});

module.exports = router;
