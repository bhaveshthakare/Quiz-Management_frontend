<<<<<<< HEAD
# Quiz Platform — Frontend

React SPA (Vite + Tailwind CSS + React Router) for the Quiz Management & Online Assessment Platform. Deploys on **Vercel**.

## Stack

- React 19, Vite, Tailwind CSS v4 (`@tailwindcss/vite`)
- React Router 7, axios, Recharts, react-hook-form, Zustand, lucide-react, react-hot-toast
- Auth: JWT stored in localStorage, axios interceptors (auto-attach token, redirect on 401)

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api` to `http://localhost:8080`, so no env vars are needed — the backend must be running locally.

## Environment

Copy `.env.example` to `.env` only if the API is not on the same origin:

```bash
VITE_API_URL=http://localhost:8080   # or your deployed Render backend
```

Leave `VITE_API_URL` empty in local dev (uses the proxy).

## Pages

- **Public**: Landing, Browse Quizzes, Quiz Details, Login, Register, Forgot/Reset Password
- **Student**: Dashboard (stats + score trend), Quiz List, Attempt (timer, palette, save-as-you-go, auto-submit), Result (score + answer review + certificate download), History, Leaderboard, Notifications
- **Admin**: Dashboard (9 stats + 6 charts), Manage Users (activate/deactivate/delete, profile view), Manage Quizzes (CRUD + publish + scheduling + negative marking), Quiz Form, Manage Questions (CRUD + CSV/Excel import), Manage Categories, All Attempts/Results, Analytics

## Deploy on Vercel

1. Push this folder to a GitHub repo.
2. Vercel → **New Project** → import the repo. Framework preset: **Vite** (build `npm run build`, output `dist`).
3. Add env var: `VITE_API_URL=https://your-backend.onrender.com` (no trailing slash).
4. `vercel.json` includes SPA rewrites so React Router works on page refresh.
=======
# Quiz-Management_frontend
A modern React.js frontend built with Vite for a full-stack web application. Features a responsive UI, API integration with Spring Boot, and optimized deployment on Vercel..
>>>>>>> 2745ea500b14d0f43dde58f3a586eb4985dce230
