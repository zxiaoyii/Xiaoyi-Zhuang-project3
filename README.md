# Xiaoyi-Zhuang-project3 — Fullstack Sudoku

## Setup

Copy `.env.example` to `.env` and fill in your values:

```
cp .env.example .env
```

Install all dependencies (only needed once):

```
npm install
```

## Local development (with hot-reload)

```
npm run dev
```

This starts both the Express backend (localhost:8000) and the Vite dev server (localhost:5173) concurrently. Open **http://localhost:5173** for live hot-reload during development.

## Test the production build locally (mirrors Render)

```
npm install && npm run build && npm run dev
```

Then open **http://localhost:8000** — this is exactly how Render runs your app.

## Deploying to Render

| Setting | Value |
|---|---|
| Build Command | `npm install && npm run build` |
| Start Command | `npm run prod` |
| Environment Variables | `MONGODB_URI` (your MongoDB Atlas SRV string), `COOKIE_SECRET`, `PORT=8000`, `NODE_VERSION=20` |

`MONGODB_URI` must match the variable name used in `backend/server.js` (via `process.env.MONGODB_URI`). Do not commit the connection string; set it only in your local `.env` and in Render (or Heroku) **Environment**.

**MongoDB Atlas:** In Atlas → **Network Access**, add your current IP, or `0.0.0.0/0` (allow from anywhere) for class projects. The URI should include a database name in the path, e.g. `...mongodb.net/sudokuapp?retryWrites=true&w=majority&...`

Make sure to set **NODE_VERSION** (e.g. `20`) in Render's environment variables.
