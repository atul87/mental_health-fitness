# SoulCare AI

SoulCare is a full-stack mental wellness application built with React, Vite, Express, and MongoDB. The current codebase includes authenticated journaling, mood analysis, guided exercises, and an AI chat experience with graceful offline fallback when Gemini is unavailable.

## Current Capabilities

- JWT-based authentication with protected backend routes
- Anonymous access flow for low-friction onboarding
- Private journal create, read, update, and delete flows
- Mood analysis, mood history, and mood insights
- Guided exercise sessions with a working timer and completion logging
- AI chat history with backend persistence and browser voice features where supported
- Frontend and backend automated test coverage
- GitHub Actions CI for tests, coverage, lint, and production build validation

## Tech Stack

Frontend:

- React
- Vite
- React Router
- Framer Motion
- Chart.js
- React Three Fiber
- Vitest
- React Testing Library
- MSW

Backend:

- Node.js
- Express
- MongoDB with Mongoose
- JWT and bcrypt
- Google Gemini SDK
- Jest
- Supertest

## Repository Layout

- `server.js` - Express app bootstrap and middleware setup
- `routes/` - API route modules
- `models/` - Mongoose models and data helpers
- `middleware/` - shared backend middleware
- `tests/` - backend integration tests
- `Mental-health/` - Vite + React frontend
- `.github/workflows/ci.yml` - CI pipeline

## Local Setup

### Backend

```bash
npm install
copy .env.example .env
```

Configure `.env`:

```env
PORT=3003
MONGODB_URI=mongodb://127.0.0.1:27017/soulcare
JWT_SECRET=replace_with_a_long_random_secret
GEMINI_API_KEY=your_google_ai_studio_key
FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

### Frontend

```bash
cd Mental-health
npm install
copy .env.example .env
npm run dev
```

Frontend `.env`:

```env
VITE_API_URL=http://localhost:3003
```

## Scripts

Root:

- `npm run dev` - start backend with nodemon
- `npm start` - start backend in production mode
- `npm test` - run backend tests
- `npm run coverage:backend` - generate backend coverage
- `npm run test:frontend` - run frontend tests from root
- `npm run lint:frontend` - run frontend lint from root
- `npm run build:frontend` - build frontend from root
- `npm run coverage:frontend` - generate frontend coverage from root
- `npm run ci:check` - backend tests, frontend tests, lint, and build

Frontend:

- `npm run dev` - start Vite dev server
- `npm test` - run Vitest once
- `npm run coverage` - run Vitest with coverage
- `npm run lint` - run ESLint
- `npm run build` - create production bundle

## Testing

### Backend

Backend tests use Jest + Supertest against the Express app directly.

Covered flows:

- registration
- login
- authenticated journal create
- authenticated journal update
- authenticated journal fetch

Run:

```bash
npm test
npm run coverage:backend
```

### Frontend

Frontend tests use Vitest + React Testing Library + MSW. API calls are intercepted at the network layer, so component behavior is tested without a live backend.

Covered components:

- `Login`
- `Journal`
- `Chatbot`
- `MoodTracker`
- `Exercises`
- `Profile`

Run:

```bash
cd Mental-health
npm test
npm run coverage
```

## CI

GitHub Actions is configured in `.github/workflows/ci.yml`.

The CI pipeline runs on push and pull request for the main working branches and performs:

- backend tests
- backend coverage
- frontend tests
- frontend coverage
- frontend lint
- frontend production build

The CD pipeline is defined in `.github/workflows/cd.yml` and deploys the frontend build to GitHub Pages on push to `main`.
Set the repository variable `VITE_API_URL` in GitHub to the backend URL you want the deployed frontend to call.

The backend CI job uses a MongoDB service container, so no external MongoDB secret is required for test execution.

## Product Notes

- Protected backend routes derive identity from the JWT and do not trust a frontend `userId`.
- If Gemini is missing or unavailable, mood analysis and chat fall back gracefully instead of crashing.
- There is no seeded demo account. Use sign up or continue anonymously.
- This project is a software product, not a crisis response service.
