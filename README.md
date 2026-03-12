# Workout Tracker

--------
This repository implements a minimal full-stack workout tracker. It has a Node.js + Express backend with JWT-based authentication, a PostgreSQL schema for persistent storage, a small static frontend located in `frontend/` to demonstrate functionality.

--------------------------------
1. Install dependencies:

```bash
npm install
```

2. Prepare the database and load the schema:

```bash
createdb my_first_project
psql -d my_first_project -f database.sql
```

3. Configure environment variables (example):

```bash
export DATABASE_URL='postgresql://<dbuser>:<dbpass>@localhost:5432/my_first_project'
export JWT_SECRET='a_secure_secret'
```

4. Start the application and open the UI:

```bash
npm start
# then open http://localhost:3000
```

API Endpoints
--------------------------------
- POST /api/users/register — Create account (body: `name`, `email`, `password`) → returns `{ user, token }`
- POST /api/users/login — Login (body: `email`, `password`) → returns `{ user, token }`
- GET /api/users/me — Inspect token payload (Authorization required)
- GET /api/workouts — List workouts for authenticated user
- POST /api/workouts — Create workout (body: `workout_date`, `workout_type`, `duration_minutes`)
- GET/PUT/DELETE /api/workouts/:id — Single-workout operations (ownership enforced)
- GET /api/exercises?workout_id=... — List exercises for a workout
- POST/PUT/DELETE /api/exercises — Create/update/delete exercises (ownership enforced)

Security
--------------------------------
- Passwords are hashed using `bcrypt`; the `password` column stores bcrypt hashes.
- Authentication uses signed JWTs (`middleware/auth.js`) and protects the API routes.
- The server enforces ownership checks so users cannot access or modify other users' data.

Files of interest
---------------------------------------------------
- `server.js` — bootstraps Express and mounts routes.
- `routes/users.js` — registration/login and token endpoints.
- `routes/workouts.js` — workout CRUD and ownership checks.
- `routes/exercises.js` — exercise CRUD and ownership checks.
- `middleware/auth.js` — JWT verification middleware.
- `database.sql` — DDL for `users`, `workouts`, `exercises`.
- `frontend/` — `index.html`, `script.js`, `style.css` (demonstration UI).

Rubric mapping
-------------------------
- Server: Express server implemented (`server.js`).
- Database: Postgres schema present with foreign keys (`database.sql`).
- Authentication: Register/login with hashed passwords and JWT (`routes/users.js`, `middleware/auth.js`).
- CRUD: Workouts and exercises support create/read/update/delete with ownership checks (`routes/*.js`).
- Frontend: Simple SPA uses fetch to exercise API (`frontend/`).







