# ClimbBeta

ClimbBeta is a full-stack platform where climbers keep a logbook of their ascents, both **indoors** (partner gyms) and **outdoors** , and follow each other in a social feed. Gym owners get a separate web backoffice to manage their gyms and routes.

It was built as a final degree project at ISEL. The whole system is already deployed and running publicly, so it can be tried without setting anything up locally.

## Live deployment

| Part | URL |
|------|-----|
| Backend API | https://api.climbbetaapp.xyz |
| Images (MinIO / S3) | https://media.climbbetaapp.xyz |
| Web backoffice (Gym Owners) | https://climbbeta-web.pages.dev |
| Mobile app (Climbers) | runs locally with Expo Go (see below) |

The backend, PostgreSQL and MinIO run in Docker on a Raspberry Pi (managed with Portainer) and are exposed to the internet through a Cloudflare Tunnel. The web app is hosted on Cloudflare Pages with auto-deploy from `main`. The public database is already seeded with gyms, routes and active climbers.

## Tech stack

| Component | Technology |
|-----------|------------|
| Backend | Kotlin, Spring Boot, JDBI (PostgreSQL) |
| Database | PostgreSQL 15 |
| Authentication | JWT (Bearer token) |
| Image storage | MinIO (S3-compatible) |
| Web frontend | React 19, Vite, TypeScript |
| Mobile frontend | React Native, Expo (SDK 54) |
| Infrastructure | Docker, Portainer, Cloudflare Tunnel + Pages |

## Architecture

```
                 Raspberry Pi  (Docker / Portainer)
      ┌──────────────────────────────────────────────────┐
      │   PostgreSQL       Spring Boot API      MinIO    │
      │   (:5432)    ◄──►   (Kotlin, :8080) ◄──► (images)│
      └────────────────────────┬─────────────────────────┘
                               │  Cloudflare Tunnel
                 ┌─────────────┴──────────────┐
        api.climbbetaapp.xyz         media.climbbetaapp.xyz
                 │                              │
      ┌──────────┴───────────┐      ┌───────────┴───────────┐
      │  Web (React / Vite)  │      │ Mobile (React Native) │
      │  Gym Owner backoffice│      │  Climber app (Expo Go)│
      │  on Cloudflare Pages │      │                       │
      └──────────────────────┘      └───────────────────────┘
```

## Trying the mobile app (quick path)

The mobile app is not published to the app stores, so it runs through **Expo Go**. Because the backend is already public, you only need to start the app — there is no database or backend to run.

You will need:
- [Expo Go](https://expo.dev/go) installed on your phone (Android or iOS)
- Node.js 20+ on your computer

Then:

```bash
git clone <repo-url>
cd ClimbBeta/frontend/ClimbBetaMobile
npm install
npx expo start -c --tunnel
```

The `.env` in that folder already points the app at the public API:

```
EXPO_PUBLIC_API_URL=https://api.climbbetaapp.xyz
```

If the file is missing, just create it with that single line. Open **Expo Go** on your phone and scan the QR code shown in the terminal. The `--tunnel` option makes it work even when the phone and the computer are on different networks (the API is public, so the phone only needs internet access).

### First run

The app opens on the login screen. Since the feed only shows people you follow, the easiest way to see it full of real content is:

1. Tap **Sign up** and create your own climber account, then log in with it. The password needs 8+ characters, one uppercase letter, one number and one symbol — the screen shows a live checklist as you type.
2. Go to the **Feed** tab and use the user search to follow a couple of active climbers who already have many logs, for example **koro** and **mario_boulders**.
3. Your feed now shows their ascents. Open a post to like it, read or add comments, or jump to the boulder's leaderboard.

## Running everything locally (optional)

If you would rather run the full stack on your machine instead of using the public API.

Prerequisites: Docker Desktop, Java 21, Node.js 20+.

### 1. Database (Docker)

From `backend/`:

```bash
docker-compose down -v   # first time only: wipes old volumes so the tables are recreated
docker-compose up -d     # starts PostgreSQL + pgAdmin
```

pgAdmin is at http://localhost:5050 (`admin@climbbeta.com` / `admin`). Add a server with host `climbbeta_db`, user `postgres`, password `1234`.

### 2. Backend API

From `backend/`:

```bash
./gradlew bootRun        # Windows: .\gradlew.bat bootRun
```

The API runs on http://localhost:8080.

### 3. Web (Gym Owner backoffice)

From `frontend/ClimbBetaWeb/`:

```bash
npm install
npm run dev              # http://localhost:5173
```

### 4. Mobile

From `frontend/ClimbBetaMobile/`, point `.env` at your machine's LAN IP (not `localhost`, the phone cannot resolve it):

```
EXPO_PUBLIC_API_URL=http://<YOUR_LAN_IP>:8080
```

Then:

```bash
npm install
npx expo start -c
```

Find your IP with `ipconfig` (Windows) or `ifconfig` (Mac/Linux) and use the Wi-Fi IPv4 address, with the phone on the same Wi-Fi network.

## Tests

**Web (Jest + React Testing Library)** — from `frontend/ClimbBetaWeb/`:

```bash
npm install
npm test
```

This runs the component, page and service test suites. The production build (`npm run build`) deliberately does not type-check or run these files — the tests have their own runner and config — so they never interfere with the deploy.

**Mobile (Jest + jest-expo + React Testing Library)** — from `frontend/ClimbBetaMobile/`:

```bash
npm install
npm test
```

On very recent Node (24+), Jest may fail to start with a `localStorage` error (`Cannot initialize local storage...`). If that happens, disable the experimental web storage when running the tests:

```bash
# Windows PowerShell
$env:NODE_OPTIONS='--no-experimental-webstorage'; npm test

# macOS / Linux
NODE_OPTIONS=--no-experimental-webstorage npm test
```

On Node 20 or 22 LTS this is not needed.

**Backend (JUnit + Mockito)** — from `backend/`, with the local database running (`docker-compose up -d` first, since the repository tests hit a real PostgreSQL):

```bash
./gradlew test        # Windows: .\gradlew.bat test
```

## Features

### Climber (mobile app)
- Sign up and sign in with JWT (the token is stored with Expo SecureStore)
- Logbook with three ascent types:
  - **Indoor** — a specific boulder of a partner gym
  - **Free Log** — a session at a non-partner gym
  - **Outdoor** — a route or boulder on real rock
- Social feed of the climbers you follow: like, comment, follow and unfollow
- Explore gyms, their active boulders and each boulder's leaderboard
- Filter a gym's boulders by grade
- Profile with stats, saved projects and your own ascent history

### Gym Owner (web backoffice)
- Sign up and account activation: a new owner starts as `PENDING` and becomes `VERIFIED` with an admin activation code
- Manage gyms (create, edit, cover image)
- Manage boulders: create with hold color, difficulty tag color and grade, and archive them (soft delete with the `is_active` flag)
- Image uploads are stored in MinIO; the database only keeps the URL

### Admin
- Generate the single-use activation codes that verify gym owners

## Roles and access control

Authentication is a Bearer JWT validated by an interceptor. Authorization is role-based (`CLIMBER`, `GYM_OWNER`, `ADMIN`) and declared per route with a `@ProtectedRoute` annotation, enforced centrally by a second interceptor. Resource-ownership rules (for example, only the owner may edit their gym) stay in the services, since they depend on the data rather than just the role.

## Documentation and database

- REST API description: `docs/climbbeta-api-docs.yaml`
- Database schema (the source of truth for the domain): `backend/src/main/resources/sql/create-schema.sql`
- Deployment and operations notes: the `docs/` folder (Docker setup, Raspberry Pi runbook, Cloudflare tunnel, web deploy)

## Local port reference

| Service | URL |
|---------|-----|
| Backend API | http://localhost:8080 |
| PostgreSQL | localhost:5432 |
| pgAdmin | http://localhost:5050 |
| Web frontend | http://localhost:5173 |
| Expo dev server | http://localhost:8081 |
