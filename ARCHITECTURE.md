# SoulCare Architecture

## Request Flow

1. The React frontend authenticates with `/api/auth/*`.
2. The backend returns a JWT token and serialized user profile.
3. Protected frontend routes call authenticated backend endpoints using `Authorization: Bearer <token>`.
4. Backend route middleware derives the user identity from the JWT and never trusts a frontend `userId`.
5. Feature data is persisted in MongoDB through Mongoose models.
6. AI requests are proxied through the backend and fall back to offline-safe responses when Gemini is unavailable.

## Modules

### Authentication

- Registration, login, anonymous access
- JWT middleware for protected routes
- Profile read/update via `/api/auth/me`

### Journal

- Create, list, update, delete
- Entries are scoped to the authenticated user

### Mood

- Mood analysis with Gemini fallback
- History and basic stats for the authenticated user

### Exercises

- Guided exercise logging
- History and stats scoped to the authenticated user

### Chat

- Persisted chat history
- Offline fallback responses when Gemini is unavailable
- Optional browser voice input and spoken replies on supported clients

## Reliability Notes

- Missing or invalid Gemini configuration does not crash the app.
- Missing `JWT_SECRET` blocks backend startup because authentication is mandatory.
- Backend tests run against the Express app directly with Supertest.
