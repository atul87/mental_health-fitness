# SoulCare Frontend

This is the Vite + React client for SoulCare.

## Setup

```bash
npm install
copy .env.example .env
npm run dev
```

Configure `.env`:

```env
VITE_API_URL=http://localhost:3003
```

## Scripts

- `npm run dev` - start the frontend locally
- `npm test` - run Vitest
- `npm run coverage` - generate the frontend coverage report
- `npm run lint` - run ESLint
- `npm run build` - create the production bundle

## Frontend Test Stack

- Vitest for test execution
- React Testing Library for rendering and interaction
- MSW for network-level API mocking

Current component coverage includes:
- login flow
- journal flow
- chatbot flow
- mood tracker filters and rendering
- exercise timer and completion flow
- profile load and update flow

## Notes

- Authentication uses JWT tokens stored in local storage.
- Protected views call authenticated backend endpoints through `src/lib/api.js`.
- AI features depend on the backend `GEMINI_API_KEY`, not a frontend API key.
