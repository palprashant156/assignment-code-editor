# CodeArena

CodeArena is a full-stack coding assessment workspace. The React/Vite client provides student and instructor experiences; the Express API owns authentication, MongoDB records, assessment timing, private asset access, autosaves and immutable submissions.

## Project layout

```text
frontend/           React + TypeScript app, Vite config, pages, styles and auth context
backend/src/        Express + TypeScript API, middleware, Mongoose models and routes
backend/test/       API unit tests
backend/uploads/    Private local image storage
frontend/dist/      Production Vite build output
frontend/legacy-public/ Original CodeCraft frontend, retained separately
backend/legacy-server/  Original CodeCraft backend, retained separately
```

## Run locally

Requirements: Node.js 20+, npm and MongoDB 6+ (local or Atlas).

```bash
npm install
cp .env.example .env
# Edit .env: set a private JWT_SECRET and ADMIN_PASSWORD before starting.
npm run dev
```

The Vite app is at `http://localhost:5173`; the API is at `http://localhost:5000`. MongoDB defaults to `mongodb://127.0.0.1:27017/codearena`. The first run creates an instructor from `ADMIN_EMAIL` / `ADMIN_PASSWORD` and seeds a published portfolio challenge. Student accounts are created through registration. Do not use the example admin password outside a local sandbox.

If the default ports are already in use, set `VITE_PORT` and `PORT` in `.env`, and set `API_PROXY_TARGET` to `http://localhost:<PORT>`.

## Production build

```bash
npm run build
NODE_ENV=production npm start
```

Set `MONGODB_URI`, `JWT_SECRET` (at least 32 random characters), `CLIENT_ORIGIN`, `COOKIE_SECURE=true`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in the production environment. In production, the API serves the built client from `frontend/dist/`. Local uploads are private and excluded from static serving; use an authenticated object-storage adapter (S3/Cloudinary) when deploying multiple API instances.

## Main flows

- Students register/sign in, browse published challenges, start/resume timed sessions, edit HTML/CSS/JS, upload private images, and submit early or at the backend-enforced deadline.
- The editor preview is a sandboxed `srcdoc` iframe without same-origin access. Student code never runs in the application document.
- Admin accounts are bootstrapped from server environment variables (registration cannot create admin users). Instructors publish and schedule assessments, set starter code and requirements, see students/submissions, preview submitted work, and download source files as ZIP.
- Progress writes are debounced in the client and persisted to MongoDB. A server worker auto-submits expired sessions, so a disconnected browser does not pause the deadline.

## API notes

All routes are under `/api`. Authentication uses an HttpOnly cookie; `/api/auth/me` restores the session. Admin endpoints are protected by role middleware. Uploads accept PNG, JPEG, WebP and restricted SVG up to 5 MB, are checked against their file signatures, and are served only to their owner (or to students for references attached to a published assessment).
