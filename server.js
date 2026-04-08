const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const moodRoutes = require('./routes/moodRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const journalRoutes = require('./routes/journalRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');

const app = express();
const PORT = process.env.PORT || 3003;
const FRONTEND_URL = process.env.FRONTEND_URL || process.env.VITE_FRONTEND_URL || 'http://localhost:5173';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/soulcare';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required to start the server.');
}

const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2) {
    return mongoose.connection.asPromise();
  }

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB successfully');
  return mongoose.connection;
};

const databaseReady = connectDatabase().catch((error) => {
  console.error('Error connecting to MongoDB:', error);
  throw error;
});

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: 'Too many authentication attempts. Please try again later.' }
});

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, error: 'Too many API chat requests from this IP, please try again after 15 minutes' }
});

if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
  console.warn('Running AI services in offline mode because GEMINI_API_KEY is missing or invalid.');
}

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/chatbot', chatLimiter, chatbotRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/exercises', exerciseRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'OK', message: 'Server is running' });
});

app.use((err, req, res, next) => {
  console.error('Critical Server Error Caught:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong internally on the server.',
    fallback: true
  });
});

const startServer = async () => {
  await databaseReady;

  return app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
};

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Server failed to start:', error);
    process.exit(1);
  });
}

module.exports = {
  app,
  connectDatabase,
  databaseReady,
  startServer
};
