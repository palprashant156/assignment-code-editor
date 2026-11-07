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

### Deploying the frontend to Netlify and the API to Render

The repository includes `netlify.toml` and `render.yaml`, so both services can be created from the same GitHub repository.

1. **Push the repository to GitHub.** The configured remote is `origin`.

2. **Create the API on Render.** In Render, choose **New → Blueprint**, select this repository, and apply `render.yaml`. It creates the `codearena-api` web service with:
   - Build command `npm install --include=dev && npm run build:backend`
   - Start command `npm start`
   - `NODE_ENV=production`, `COOKIE_SECURE=true`, a generated `JWT_SECRET`, and a health check at `/api/health`

   Enter these secret values when prompted:
   - `MONGODB_URI` — a MongoDB Atlas connection string. Add `0.0.0.0/0` to Atlas network access (Render free instances use dynamic outbound IPs), or the static outbound IPs on a paid plan.
   - `CLIENT_ORIGIN` — the exact Netlify origin, for example `https://your-site.netlify.app` (no trailing slash, no `/api`).
   - `ADMIN_EMAIL` and `ADMIN_PASSWORD` — the bootstrap instructor account.

   The API is live at `https://<service>.onrender.com`; `GET /api/health` should return `{"status":"ok"}`.

3. **Create the site on Netlify.** In Netlify, choose **Add new site → Import an existing project**, select the repository, and deploy. Netlify reads `netlify.toml`:
   - Build command `npm run build:frontend`
   - Publish directory `frontend/dist`
   - Node 20 (also pinned by `.nvmrc`)

   Add a build environment variable `VITE_API_URL` set to the Render origin, for example `https://codearena-api.onrender.com` (no `/api` suffix). `VITE_API_URL` is baked in at build time, so redeploy after changing it. The `/*` redirect serves `index.html` for client-side routes such as `/dashboard` and `/admin`.

4. **Connect the two services.** Set `CLIENT_ORIGIN` on Render to the exact Netlify origin, then redeploy the API. Both sites use HTTPS, so cross-site auth cookies work with `SameSite=None; Secure`. If you add custom domains, update `CLIENT_ORIGIN` and `VITE_API_URL` to the final custom origins and redeploy both services.

Notes:
- Render's filesystem is ephemeral. Attach a persistent disk mounted at `/var/data` and set `UPLOAD_DIR=/var/data/uploads` to retain uploaded assessment images across deploys (paid instances), or use persistent object storage.
- Render free web services spin down after inactivity; the first request may take 30–60 seconds.

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
