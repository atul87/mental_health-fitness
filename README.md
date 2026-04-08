# SoulCare AI

SoulCare is a full-stack mental wellness application built with React, Vite, Express, and MongoDB. It includes authenticated journaling, mood analysis, guided exercises, and an AI chat experience with offline fallback when Gemini is unavailable.

## What Works

- JWT-based authentication with protected backend routes
- Private journal CRUD for the signed-in user
- Mood analysis and mood history tracking
- Guided exercise logging with a working session timer
- AI chat history with backend persistence and offline fallback
- Anonymous session support

## Stack

Frontend:
- React
- Vite
- React Router
- Framer Motion
- Chart.js
- React Three Fiber

Backend:
- Node.js
- Express
- MongoDB with Mongoose
- JWT and bcrypt
- Google Gemini SDK
- Jest and Supertest

## Local Setup

### 1. Backend

```bash
npm install
copy .env.example .env
```

Update `.env` with your values:

```env
PORT=3003
MONGODB_URI=mongodb://127.0.0.1:27017/soulcare
JWT_SECRET=replace_with_a_long_random_secret
GEMINI_API_KEY=your_google_ai_studio_key
FRONTEND_URL=http://localhost:5173
```

Start the API:

```bash
npm run dev
```

### 2. Frontend

```bash
cd Mental-health
npm install
copy .env.example .env
npm run dev
```

The frontend expects the backend at `http://localhost:3003` by default.

## Scripts

Backend:
- `npm run dev` — start with nodemon
- `npm start` — production start
- `npm test` — run backend tests (Jest + Supertest)

Frontend:
- `npm run dev` — Vite dev server
- `npm run build` — production bundle
- `npm run lint` — ESLint check
- `npm test` — run frontend tests (Vitest)
- `npm run coverage` — generate test coverage report
- `npm run test:ui` — open Vitest interactive UI

## 🧪 Testing

This project has full-stack testing coverage across both backend and frontend.

### Backend — Jest + Supertest

Tests cover authenticated REST API routes using a real MongoDB connection.

```bash
npm test
```

### Frontend — Vitest + React Testing Library + MSW

Tests cover UI components with real API simulation via Mock Service Worker (MSW). No real backend needed.

```bash
cd Mental-health
npm test          # run all tests once
npm run coverage  # run with coverage report
npm run test:ui   # open interactive test UI
```

**What's tested:**

| Test File | What it covers |
|---|---|
| `Login.test.jsx` | Login form render, submit flow, error state on bad credentials |
| `Journal.test.jsx` | Empty state, journal entry creation via UI |
| `Chatbot.test.jsx` | Online mode reply, offline mode fallback on API failure |

**Testing architecture:**

- `vi.mock` for Three.js Canvas (WebGL unsupported in jsdom)
- MSW intercepts all `fetch` calls at the network level — no function mocking
- `AuthContext` injected with a mock user for isolated renders
- jsdom patched with `scrollIntoView` stub

### CI/CD — GitHub Actions

Every push to `main` or `develop` automatically:

1. Runs backend tests (Jest)
2. Runs frontend tests (Vitest)
3. Generates coverage report
4. Runs linting
5. Builds the frontend bundle

Add these secrets to your GitHub repo (`Settings → Secrets → Actions`):

| Secret | Description |
|---|---|
| `MONGODB_URI` | Your MongoDB connection string |
| `JWT_SECRET` | Your JWT signing secret |
| `GEMINI_API_KEY` | Google AI Studio API key |

## Current Product Notes

- Chatbot voice input uses the browser speech recognition API when supported.
- Spoken replies use browser speech synthesis when enabled.
- If `GEMINI_API_KEY` is missing or invalid, chat and mood analysis fall back gracefully.
- There is no seeded demo account. Use sign up or continue anonymously.
