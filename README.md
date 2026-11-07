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

### Deploying the frontend to Vercel, the API to Render, and the database to MongoDB Atlas

The repository includes `vercel.json` and `render.yaml`, so both services can be created from the same GitHub repository.

1. **Create the MongoDB Atlas database.**
   - Create a free M0 cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Under **Database Access**, add a database user with a strong password.
   - Under **Network Access**, add `0.0.0.0/0` so Render can connect (Render free instances use dynamic outbound IPs), or the static outbound IPs on a paid plan.
   - Copy the driver connection string, add the database name, and URL-encode special characters in the password:
     `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/codearena?retryWrites=true&w=majority`
   - The API creates the collections, indexes, admin account and sample assessment on first start.

2. **Create the API on Render.** In Render, choose **New → Blueprint**, select this repository, and apply `render.yaml`. It creates the `codearena-api` web service with:
   - Build command `npm install --include=dev && npm run build:backend`
   - Start command `npm start`
   - `NODE_ENV=production`, `COOKIE_SECURE=true`, a generated `JWT_SECRET`, and a health check at `/api/health`

   Enter these values when prompted:
   - `MONGODB_URI` — the Atlas connection string from step 1.
   - `CLIENT_ORIGIN` — the exact Vercel origin, for example `https://your-project.vercel.app` (no trailing slash, no `/api`). A comma-separated list is accepted for custom domains or specific preview URLs.
   - `ADMIN_EMAIL` and `ADMIN_PASSWORD` — the bootstrap instructor account.

   The API is live at `https://<service>.onrender.com`; `GET /api/health` should return `{"status":"ok"}`.

3. **Create the frontend on Vercel.** In Vercel, choose **Add New → Project**, import the repository, and deploy. Vercel reads `vercel.json`:
   - Build command `npm run build:frontend`
   - Output directory `frontend/dist`
   - Node 22 (also pinned by `.nvmrc`)

   Add a project environment variable `VITE_API_URL` set to the Render origin, for example `https://codearena-api.onrender.com` (no `/api` suffix, no trailing slash). `VITE_API_URL` is baked in at build time, so redeploy after changing it. The `/(.*)` rewrite serves `index.html` for client-side routes such as `/dashboard` and `/admin`.

4. **Connect the two services.** Set `CLIENT_ORIGIN` on Render to the exact Vercel origin, then redeploy the API. Both sites use HTTPS, so cross-site auth cookies work with `SameSite=None; Secure`. If you add custom domains, update `CLIENT_ORIGIN` and `VITE_API_URL` to the final custom origins and redeploy both services.

Notes:
- Cross-site cookies can be blocked by strict browser privacy settings (notably Safari and Firefox). For the most reliable auth, put both apps under one site, for example `app.example.com` on Vercel and `api.example.com` on Render.
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
