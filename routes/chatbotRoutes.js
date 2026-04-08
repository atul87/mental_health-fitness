const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const ChatMessage = require('../models/ChatModel');
const { protect } = require('../middleware/auth');

const router = express.Router();

let genAI = null;
let model = null;

if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_API_KEY') {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  } catch (error) {
    console.warn('Failed to initialize Gemini:', error);
  }
}

const SYSTEM_PROMPT = `
You are SoulCare, an empathetic and supportive AI mental health companion.
Your goal is to provide a safe, non-judgmental space for users to express their feelings.

Follow these guidelines:
1. Always be empathetic, warm, and validating.
2. If the user mentions seeking professional help, finding a doctor, or severe distress, include this JSON block at the end of your response on a new line:
   {"trigger": "show_doctors", "emotion": "the primary emotion"}
3. Keep responses relatively concise and conversational.
4. If they are in crisis, gently encourage them to contact emergency services or a trusted person nearby.
`;

const parseAIResponse = (text) => {
  let cleanText = text;
  let emotion = null;
  let doctors = [];

  const triggerRegex = /\{"trigger":\s*"show_doctors",\s*"emotion":\s*"([^"]+)"\}/;
  const match = text.match(triggerRegex);

  if (match) {
    emotion = match[1];
    cleanText = text.replace(triggerRegex, '').trim();

    const specialists = {
      anxiety: ['Psychiatrist', 'Cognitive Behavioral Therapist'],
      depression: ['Clinical Psychologist', 'Psychiatrist'],
      stress: ['Counselor', 'Therapist'],
      anger: ['Behavioral Therapist', 'Counselor'],
      trauma: ['Trauma Specialist', 'EMDR Therapist'],
      general: ['General Therapist', 'Psychologist']
    };

    const types = specialists[emotion.toLowerCase()] || specialists.general;
    doctors = types.map((type, index) => ({
      id: index + 1,
      name: type,
      specialty: type,
      rating: 4.8 + (index * 0.1),
      available: index === 0 ? 'Search locally' : 'Telehealth options available'
    }));
  } else {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('anx') || lowerText.includes('worry')) emotion = 'anxious';
    else if (lowerText.includes('sad') || lowerText.includes('depress')) emotion = 'sad';
    else if (lowerText.includes('ang') || lowerText.includes('frustrat')) emotion = 'angry';
    else if (lowerText.includes('stress') || lowerText.includes('overwhelm')) emotion = 'stressed';
  }

  return { cleanText, emotion, doctors };
};

router.use(protect);

router.get('/history', async (req, res) => {
  try {
    const messages = await ChatMessage.find({ userId: req.userId }).sort({ createdAt: 1 });

    const formattedMessages = messages.map((message) => ({
      id: message._id,
      text: message.text,
      sender: message.sender,
      emotion: message.emotion,
      doctors: message.doctors,
      type: message.type,
      createdAt: message.createdAt
    }));

    res.json({ success: true, messages: formattedMessages });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch chat history' });
  }
});

router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const userSavedMsg = await ChatMessage.create({
      userId: req.userId,
      text: message,
      sender: 'user'
    });

    const formattedHistory = [
      {
        role: 'user',
        parts: [{ text: SYSTEM_PROMPT }]
      },
      {
        role: 'model',
        parts: [{ text: 'Understood. I will stay empathetic and add the trigger JSON when guided care is needed.' }]
      }
    ];

    if (Array.isArray(history)) {
      history.forEach((item) => {
        if (item.sender === 'user' || item.sender === 'bot') {
          formattedHistory.push({
            role: item.sender === 'user' ? 'user' : 'model',
            parts: [{ text: item.text }]
          });
        }
      });
    }

    formattedHistory.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const offlineResponses = [
      "I'm here with you. Try taking a slow breath.",
      "Would you like to write what's on your mind? I'm listening.",
      "You're not alone in this feeling. Take your time.",
      "It's okay to feel overwhelmed. We can take this one step at a time."
    ];

    let responseText = offlineResponses[Math.floor(Math.random() * offlineResponses.length)];
    let mode = 'offline';

    if (model) {
      try {
        const chat = model.startChat({
          history: formattedHistory.slice(0, -1)
        });
        const result = await chat.sendMessage(message);
        responseText = result.response.text();
        mode = 'online';
      } catch (googleError) {
        console.error('Google AI request failed, falling back to offline mode:', googleError.message);
      }
    }

    const { cleanText, emotion, doctors } = parseAIResponse(responseText);

    const botSavedMsg = await ChatMessage.create({
      userId: req.userId,
      text: cleanText,
      sender: 'bot',
      emotion: emotion || 'general',
      doctors,
      type: doctors.length > 0 ? 'recommendation' : 'text'
    });

    res.json({
      success: true,
      response: cleanText,
      emotion: emotion || 'general',
      doctors,
      type: doctors.length > 0 ? 'recommendation' : 'text',
      mode,
      botMessageId: botSavedMsg._id,
      botMessageCreatedAt: botSavedMsg.createdAt,
      userMessageId: userSavedMsg._id,
      userMessageCreatedAt: userSavedMsg.createdAt
    });
  } catch (error) {
    console.error('Chatbot API Error:', error);

    let errorMessage = 'Failed to generate response. Please try again.';
    if (error.message && error.message.includes('API key not valid')) {
      errorMessage = 'Server configuration error: Invalid AI API key.';
    }

    res.status(500).json({ success: false, error: errorMessage });
  }
});

module.exports = router;
