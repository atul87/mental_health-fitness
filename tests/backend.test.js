const request = require('supertest');
const mongoose = require('mongoose');
const { app, databaseReady } = require('../server');
const User = require('../models/User');
const { Journal } = require('../models/JournalModel');

describe('SoulCare Backend API Tests', () => {
  const dummyUser = {
    name: 'TestUser',
    email: `test${Date.now()}@example.com`,
    password: 'Password123!'
  };

  let token = '';
  let userId = '';
  let journalId = '';

  beforeAll(async () => {
    await databaseReady;
  });

  afterAll(async () => {
    if (journalId) {
      await Journal.findByIdAndDelete(journalId);
    }

    if (userId) {
      await User.findByIdAndDelete(userId);
    }

    await mongoose.connection.close();
  });

  it('registers a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(dummyUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(dummyUser.email);

    token = res.body.token;
    userId = res.body.user.id;
  });

  it('logs in the user and returns JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: dummyUser.email,
        password: dummyUser.password
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('creates a new journal entry for the authenticated user', async () => {
    const res = await request(app)
      .post('/api/journal')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'QA Testing Diary',
        content: 'This is an automated backend test executing via Supertest.',
        mood: 8
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.entry.title).toBe('QA Testing Diary');

    journalId = res.body.entry._id;
  });

  it('updates an existing journal entry', async () => {
    const res = await request(app)
      .put(`/api/journal/${journalId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated QA Testing Diary',
        content: 'This entry was updated by the automated backend test.',
        mood: 7
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.entry.title).toBe('Updated QA Testing Diary');
  });

  it('fetches journal entries for the authenticated user', async () => {
    const res = await request(app)
      .get('/api/journal')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.entries.length).toBeGreaterThan(0);
    expect(res.body.entries[0].title).toBe('Updated QA Testing Diary');
  });
});
