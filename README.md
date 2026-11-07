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
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
# Edit backend/.env: set a private JWT_SECRET and ADMIN_PASSWORD before starting.
npm run dev
```

The Vite app is at `http://localhost:5173`; the API is at `http://localhost:5000`. MongoDB defaults to `mongodb://127.0.0.1:27017/codearena`. The first run creates an instructor from `ADMIN_EMAIL` / `ADMIN_PASSWORD` and seeds a published portfolio challenge. Student accounts are created through registration. Do not use the example admin password outside a local sandbox.

Frontend settings live in `frontend/.env`; backend settings live in `backend/.env`. If the default ports are already in use, change `VITE_PORT` and `API_PROXY_TARGET` in `frontend/.env`, then set the matching `PORT` and `CLIENT_ORIGIN` in `backend/.env`.

### Deploying frontend to Vercel and API to Render

- In Vercel, set `VITE_API_URL` to the Render service origin, for example `https://your-codearena-api.onrender.com` (no `/api` suffix), then redeploy. Set the project root to the repository root and output directory to `frontend/dist`.
- In Render, create a Node web service with build command `npm install && npm run build` and start command `npm start`. Set `MONGODB_URI`, a random `JWT_SECRET` of at least 32 characters, `CLIENT_ORIGIN` to the exact Vercel origin, `COOKIE_SECURE=true`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. Render provides `PORT` automatically.
- Production auth cookies use `SameSite=None; Secure` for cross-origin requests. For stronger browser privacy compatibility, use custom frontend/API domains under the same site (for example, `app.example.com` and `api.example.com`).
- Render's local filesystem is ephemeral by default. Attach a persistent disk mounted at `/var/data` and set `UPLOAD_DIR=/var/data/uploads` to retain uploaded assessment images across deploys, or use persistent object storage.

## Production build

```bash
npm run build
NODE_ENV=production npm start
```

Set `MONGODB_URI`, `JWT_SECRET` (at least 32 random characters), `CLIENT_ORIGIN`, `COOKIE_SECURE=true`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `backend/.env`. Set `VITE_API_URL` in `frontend/.env` if the API is hosted on a separate origin. In production, the API serves the built client from `frontend/dist/`. Local uploads are private and excluded from static serving; use an authenticated object-storage adapter (S3/Cloudinary) when deploying multiple API instances.

## Main flows

- Students register/sign in, browse published challenges, start/resume timed sessions, edit HTML/CSS/JS, upload private images, and submit early or at the backend-enforced deadline.
- The editor preview is a sandboxed `srcdoc` iframe without same-origin access. Student code never runs in the application document.
- Admin accounts are bootstrapped from server environment variables (registration cannot create admin users). Instructors publish and schedule assessments, set starter code and requirements, see students/submissions, preview submitted work, and download source files as ZIP.
- Progress writes are debounced in the client and persisted to MongoDB. A server worker auto-submits expired sessions, so a disconnected browser does not pause the deadline.

## API notes

All routes are under `/api`. Authentication uses an HttpOnly cookie; `/api/auth/me` restores the session. Admin endpoints are protected by role middleware. Uploads accept PNG, JPEG, WebP and restricted SVG up to 5 MB, are checked against their file signatures, and are served only to their owner (or to students for references attached to a published assessment).
