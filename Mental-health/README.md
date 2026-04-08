# SoulCare Frontend

This frontend is a Vite + React client for the SoulCare backend API.

## Setup

```bash
npm install
copy .env.example .env
npm run dev
```

`.env.example`:

```env
VITE_API_URL=http://localhost:3003
```

## Notes

- Authentication is handled with JWT tokens stored in local storage.
- Protected data is fetched from authenticated backend endpoints.
- AI features depend on the backend `GEMINI_API_KEY`, not a frontend API key.
