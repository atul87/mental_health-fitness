# SoulCare

SoulCare is a full-stack mental wellness app with a React + Vite frontend and an Express + MongoDB backend. It includes authentication, journaling, mood tracking/analysis, guided exercises, and an AI chat experience with backend fallback behavior when Gemini is unavailable.

## Highlights

- JWT-based auth with protected API routes
- Anonymous access option for low-friction onboarding
- Private CRUD journal entries per user
- Mood history and AI-assisted mood analysis
- Guided exercises with timer and completion logging
- Chat history persistence with optional browser voice features
- Automated backend and frontend test suites with coverage

## Tech Stack

Backend:

- Node.js
- Express
- MongoDB + Mongoose
- JWT + bcrypt
- Google Gemini SDK
- Jest + Supertest

Frontend:

- React
- Vite
- React Router
- Framer Motion
- Chart.js
- React Three Fiber
- Vitest + React Testing Library + MSW

## Repository Structure

- `server.js`: backend app bootstrap and middleware wiring
- `routes/`: API route modules
- `models/`: Mongoose models
- `middleware/`: shared backend middleware
- `tests/`: backend tests
- `Mental-health/`: frontend app
- `ARCHITECTURE.md`: request flow and module notes
- `.github/workflows/ci.yml`: CI pipeline
- `.github/workflows/cd.yml`: frontend deployment pipeline

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB (local or remote)

## Quick Start

### 1. Install Dependencies

From the repository root:

```bash
npm install
npm --prefix Mental-health install
```

### 2. Configure Environment

Backend env:

```bash
copy .env.example .env
```

Frontend env:

```bash
copy Mental-health\.env.example Mental-health\.env
```

Backend `.env` values:

| Variable | Required | Example |
| --- | --- | --- |
| `PORT` | No | `3003` |
| `MONGODB_URI` | Yes | `mongodb://127.0.0.1:27017/soulcare` |
| `JWT_SECRET` | Yes | `replace_with_a_long_random_secret` |
| `GEMINI_API_KEY` | Recommended | `your_google_ai_studio_key` |
| `FRONTEND_URL` | Yes | `http://localhost:5173` |

Frontend `Mental-health/.env` values:

| Variable | Required | Example |
| --- | --- | --- |
| `VITE_API_URL` | Yes | `http://localhost:3003` |

### 3. Run Development Servers

Backend (root):

```bash
npm run dev
```

Frontend (new terminal):

```bash
npm --prefix Mental-health run dev
```

## Scripts

Root scripts:

- `npm run dev`: start backend with nodemon
- `npm start`: start backend in production mode
- `npm test`: run backend tests
- `npm run test:backend`: run backend tests
- `npm run coverage:backend`: backend coverage report
- `npm run test:frontend`: run frontend tests from root
- `npm run lint:frontend`: run frontend lint from root
- `npm run build:frontend`: build frontend from root
- `npm run coverage:frontend`: frontend coverage report from root
- `npm run ci:check`: backend tests + frontend tests + lint + build

Frontend scripts (`Mental-health/package.json`):

- `npm run dev`: start Vite dev server
- `npm run build`: create production bundle
- `npm run preview`: preview production bundle
- `npm run lint`: run ESLint
- `npm test`: run Vitest once
- `npm run test:watch`: run Vitest in watch mode
- `npm run test:ui`: run Vitest UI
- `npm run coverage`: run frontend coverage

## Testing and Coverage

Backend:

```bash
npm test
npm run coverage:backend
```

Frontend:

```bash
npm --prefix Mental-health test
npm --prefix Mental-health run coverage
```

Coverage output:

- Backend: `coverage/backend/`
- Frontend: `Mental-health/coverage/`

## API Overview

Base path: `/api`

- `/api/auth`: register, login, anonymous access, profile endpoints
- `/api/journal`: authenticated journal CRUD
- `/api/mood`: mood logging, history, analysis
- `/api/exercises`: exercise logging and history
- `/api/chatbot`: AI chat and chat history

## CI/CD

- CI workflow: `.github/workflows/ci.yml`
- CD workflow: `.github/workflows/cd.yml`

CI validates backend tests/coverage and frontend tests/coverage/lint/build.
CD deploys the frontend to GitHub Pages on `main`.

For deployed frontend calls, configure the repository variable `VITE_API_URL` to your backend URL.

## Notes

- Protected routes derive identity from JWT claims and do not trust client-supplied user IDs.
- If Gemini is unavailable, AI-dependent features return fallback behavior instead of crashing.
- No seeded demo account is included; use sign up or continue anonymously.
- This project is software for wellness workflows and is not a crisis response service.
