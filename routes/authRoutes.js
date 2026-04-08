const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const DEFAULT_BIO = 'Mental wellness enthusiast focused on daily mindfulness and self-care.';
const DEFAULT_GOALS = ['Track mood daily', 'Practice meditation', 'Write in journal'];

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  joinDate: user.createdAt,
  avatar: user.avatar,
  mood: user.mood,
  streak: user.streak,
  bio: user.bio || DEFAULT_BIO,
  goals: user.goals?.length ? user.goals : DEFAULT_GOALS,
  preferences: user.preferences || {
    notifications: true,
    publicProfile: false,
    shareProgress: true
  },
  isAnonymous: Boolean(user.isAnonymous)
});

const generateToken = (user) => (
  jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  )
);

router.post('/register', async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      mood: 'neutral',
      streak: 0,
      bio: DEFAULT_BIO,
      goals: DEFAULT_GOALS
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      token: generateToken(newUser),
      user: serializeUser(newUser)
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

router.post('/register-anonymous', async (req, res) => {
  try {
    const randomSeed = Math.floor(Math.random() * 1000000);
    const email = `anonymous${randomSeed}@example.com`;
    const password = await bcrypt.hash(Date.now().toString(), 10);

    const newUser = new User({
      name: 'Anonymous User',
      email,
      password,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      mood: 'neutral',
      streak: 0,
      bio: 'Using SoulCare anonymously to focus on mental wellness and self-care.',
      goals: DEFAULT_GOALS,
      isAnonymous: true
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      token: generateToken(newUser),
      user: serializeUser(newUser)
    });
  } catch (error) {
    console.error('Anonymous registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during anonymous login' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      token: generateToken(user),
      user: serializeUser(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

router.use(protect);

router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user: serializeUser(user) });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/me', async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const nextEmail = req.body.email?.trim().toLowerCase();
    if (nextEmail && nextEmail !== user.email) {
      const emailInUse = await User.findOne({ email: nextEmail, _id: { $ne: user._id } });
      if (emailInUse) {
        return res.status(400).json({ success: false, message: 'Email is already in use' });
      }
      user.email = nextEmail;
    }

    if (typeof req.body.name === 'string' && req.body.name.trim()) {
      user.name = req.body.name.trim();
    }

    if (typeof req.body.bio === 'string') {
      user.bio = req.body.bio.trim() || DEFAULT_BIO;
    }

    if (Array.isArray(req.body.goals)) {
      user.goals = req.body.goals
        .map((goal) => String(goal).trim())
        .filter(Boolean)
        .slice(0, 5);
    }

    if (req.body.preferences && typeof req.body.preferences === 'object') {
      user.preferences = {
        notifications: req.body.preferences.notifications ?? user.preferences.notifications,
        publicProfile: req.body.preferences.publicProfile ?? user.preferences.publicProfile,
        shareProgress: req.body.preferences.shareProgress ?? user.preferences.shareProgress
      };
    }

    if (typeof req.body.avatar === 'string' && req.body.avatar.trim()) {
      user.avatar = req.body.avatar.trim();
    }

    await user.save();

    res.json({ success: true, user: serializeUser(user) });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating profile' });
  }
});

module.exports = router;
