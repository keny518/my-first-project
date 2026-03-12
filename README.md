# Workout Tracker — My First Project

Minimal workout tracker with a Node.js + Express backend, PostgreSQL schema, and a small frontend.

**Contents**
- Backend: `server.js`, `routes/`, `middleware/` (Express + JWT auth)
- Database schema: `database.sql` (Postgres)
- Frontend: `frontend/` (static HTML/CSS/JS)

**Prerequisites**
- Node.js 18+ and npm
- PostgreSQL (local or remote)

**Quick start**
1. Install dependencies:

```bash
npm install
```

2. Create a Postgres database and load the schema:

```bash
# create database (adjust name as desired)
createdb my_first_project

# load schema
psql -d my_first_project -f database.sql
```

3. Set environment variables (optional). Example export commands for macOS / Linux:

```bash
export DATABASE_URL=postgresql://localhost:5432/my_first_project
export JWT_SECRET=your_jwt_secret_here
```

4. Start the server:

```bash
npm start
# or for development with auto-reload:
npm run dev
```

5. Open the frontend in a browser:

http://localhost:3000

**API summary**
- POST /api/users/register — register (body: name, email, password)
- POST /api/users/login — login (body: email, password) -> returns `token`
- GET /api/users/me — get token payload (Authorization: Bearer <token>)
- GET /api/workouts — list workouts for authenticated user
- POST /api/workouts — create workout (body: workout_date, workout_type, duration_minutes)
- GET /api/workouts/:id — get a single workout
- PUT /api/workouts/:id — update workout
- DELETE /api/workouts/:id — delete workout (also deletes related exercises)
- GET /api/exercises?workout_id=... — list exercises for a workout
- POST /api/exercises — create exercise (body: workout_id, exercise_name, sets, reps, weight)
- PUT /api/exercises/:id — update exercise
- DELETE /api/exercises/:id — delete exercise

All protected endpoints require an `Authorization: Bearer <token>` header returned from `/api/users/login` or `/api/users/register`.

**Database notes**
- Passwords are stored hashed (bcrypt) by the server — the `password` column was increased to 255 chars to store hashes.
- `users.email` has a unique constraint to avoid duplicates.

**Rubric / Checklist**
- [x] Uses Node/Express for backend (`server.js`, `routes/`).
- [x] PostgreSQL schema present in `database.sql`.
- [x] User registration/login with JWT authentication (`middleware/auth.js`).
- [x] CRUD routes for workouts and exercises (`routes/*.js`).
- [x] Frontend that interacts with the API (`frontend/`).
- [ ] README with run and setup instructions (this file).
- [ ] Tests and local verification (manual testing recommended).

If you want, I can also:
- add a small seed script to populate example users/workouts,
- add unit tests or Postman/HTTP collection,
- deploy to a free service (Render, Railway) and provide a live demo.

**Troubleshooting**
- If you see DB connection errors, verify `DATABASE_URL` and that Postgres is running.
- For issues with JWT, ensure `JWT_SECRET` is set; otherwise a default dev secret is used.

**Contact**
Open issues on the repo or ask me to run tests locally and I'll help debug.

