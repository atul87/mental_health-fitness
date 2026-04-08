import { http, HttpResponse } from 'msw'

const defaultUser = {
  id: 'user-123',
  name: 'Test User',
  email: 'test@test.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test@test.com',
  bio: 'Testing profile bio',
  goals: ['Track mood daily', 'Practice meditation'],
  joinDate: '2026-01-10T10:00:00.000Z',
  isAnonymous: false
}

export const handlers = [
  http.post('http://localhost:3003/api/auth/login', () => {
    return HttpResponse.json({
      success: true,
      token: 'fake-token',
      user: defaultUser
    })
  }),

  http.post('http://localhost:3003/api/auth/register-anonymous', () => {
    return HttpResponse.json({
      success: true,
      token: 'fake-token',
      user: { ...defaultUser, id: 'anon-123', name: 'Anonymous User', isAnonymous: true }
    })
  }),

  http.get('http://localhost:3003/api/auth/me', () => {
    return HttpResponse.json({
      success: true,
      user: defaultUser
    })
  }),

  http.put('http://localhost:3003/api/auth/me', async ({ request }) => {
    const body = await request.json()

    return HttpResponse.json({
      success: true,
      user: {
        ...defaultUser,
        ...body,
        goals: body.goals || defaultUser.goals
      }
    })
  }),

  http.get('http://localhost:3003/api/journal', () => {
    return HttpResponse.json({ success: true, entries: [] })
  }),

  http.post('http://localhost:3003/api/journal', async ({ request }) => {
    const body = await request.json()

    return HttpResponse.json({
      success: true,
      entry: {
        _id: 'entry-123',
        title: body.title || 'My Great Day',
        content: body.content || 'Feeling great today!',
        mood: body.mood || 5,
        createdAt: new Date().toISOString()
      }
    })
  }),

  http.put('http://localhost:3003/api/journal/:id', async ({ params, request }) => {
    const body = await request.json()

    return HttpResponse.json({
      success: true,
      entry: {
        _id: params.id,
        title: body.title,
        content: body.content,
        mood: body.mood,
        createdAt: new Date().toISOString()
      }
    })
  }),

  http.delete('http://localhost:3003/api/journal/:id', () => {
    return HttpResponse.json({ success: true })
  }),

  http.get('http://localhost:3003/api/mood/history', () => {
    return HttpResponse.json({ success: true, moods: [] })
  }),

  http.post('http://localhost:3003/api/mood/analyze', () => {
    return HttpResponse.json({
      success: true,
      mood: { mood: 'Neutral', confidence: 0.5, keywords: ['calm'] }
    })
  }),

  http.get('http://localhost:3003/api/exercises/history', () => {
    return HttpResponse.json({ success: true, history: [] })
  }),

  http.post('http://localhost:3003/api/exercises/complete', async ({ request }) => {
    const body = await request.json()

    return HttpResponse.json({
      success: true,
      exercise: {
        _id: 'exercise-123',
        ...body,
        completedAt: new Date().toISOString()
      }
    })
  }),

  http.get('http://localhost:3003/api/chatbot/history', () => {
    return HttpResponse.json({ success: true, messages: [] })
  }),

  http.post('http://localhost:3003/api/chatbot/chat', () => {
    return HttpResponse.json({
      success: true,
      response: "I'm here to support you.",
      mode: 'online',
      emotion: 'supportive',
      botMessageId: 'bot-msg-123',
      botMessageCreatedAt: new Date().toISOString()
    })
  })
]

export const offlineChatHandler = http.post(
  'http://localhost:3003/api/chatbot/chat',
  () => HttpResponse.error()
)
