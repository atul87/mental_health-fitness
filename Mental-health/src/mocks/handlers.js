import { http, HttpResponse } from 'msw';

export const handlers = [
  // 🔐 Auth: Login
  http.post('http://localhost:3003/api/auth/login', () => {
    return HttpResponse.json({
      token: 'fake-token',
      user: { id: 'user-123', name: 'Test User', email: 'test@test.com' },
    });
  }),

  // 🔐 Auth: Register anonymous
  http.post('http://localhost:3003/api/auth/register-anonymous', () => {
    return HttpResponse.json({
      token: 'fake-token',
      user: { id: 'anon-123', name: 'Anonymous User', email: null },
    });
  }),

  // 🔐 Auth: /me
  http.get('http://localhost:3003/api/auth/me', () => {
    return HttpResponse.json({
      user: { id: 'user-123', name: 'Test User', email: 'test@test.com' },
    });
  }),

  // 📓 Journal: List
  http.get('http://localhost:3003/api/journal', () => {
    return HttpResponse.json({ success: true, entries: [] });
  }),

  // 📓 Journal: Create
  http.post('http://localhost:3003/api/journal', () => {
    return HttpResponse.json({
      success: true,
      entry: {
        _id: 'entry-123',
        title: 'My Great Day',
        content: 'Feeling great today!',
        mood: 5,
        createdAt: new Date().toISOString(),
      },
    });
  }),

  // 🤖 Chatbot: History
  http.get('http://localhost:3003/api/chatbot/history', () => {
    return HttpResponse.json({ success: true, messages: [] });
  }),

  // 🤖 Chatbot: Chat (online mode by default)
  http.post('http://localhost:3003/api/chatbot/chat', () => {
    return HttpResponse.json({
      success: true,
      response: "I'm here to support you.",
      mode: 'online',
      emotion: 'supportive',
      botMessageId: 'bot-msg-123',
      botMessageCreatedAt: new Date().toISOString(),
    });
  }),

  // 💭 Mood analysis
  http.post('http://localhost:3003/api/mood/analyze', () => {
    return HttpResponse.json({
      success: true,
      mood: { mood: 'Neutral', score: 0.5 },
    });
  }),
];

// Offline chatbot handler — export for per-test override
export const offlineChatHandler = http.post(
  'http://localhost:3003/api/chatbot/chat',
  () => HttpResponse.error()
);
