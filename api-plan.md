Resources (tables):
- users (auth)
- workouts
- exercises
- goals

| Method | URL | What it does |
|---|---|---|
| POST | /api/users/register | Create a user account, return `{ user, token }` |
| POST | /api/users/login | Login, return `{ user, token }` |
| GET | /api/users/me | Return current user from JWT |
| GET | /api/workouts | Return all workouts for the logged-in user |
| GET | /api/workouts/:id | Return one workout by id (owned by user) |
| POST | /api/workouts | Create a workout for the logged-in user |
| PUT | /api/workouts/:id | Update a workout (owned by user) |
| DELETE | /api/workouts/:id | Delete a workout (owned by user) |
| GET | /api/workouts/:id/exercises | **Sub-resource**: return all exercises for a specific workout |
| GET | /api/exercises | Return all exercises for the logged-in user (or filter with `?workout_id=`) |
| GET | /api/exercises/:id | Return one exercise by id (must belong to user) |
| POST | /api/exercises | Create an exercise for a workout (must belong to user) |
| PUT | /api/exercises/:id | Update an exercise (must belong to user) |
| DELETE | /api/exercises/:id | Delete an exercise (must belong to user) |
| GET | /api/goals | Return all goals for the logged-in user |
| GET | /api/goals/:id | Return one goal by id (owned by user) |
| POST | /api/goals | Create a goal for the logged-in user |
| PUT | /api/goals/:id | Update a goal (owned by user) |
| DELETE | /api/goals/:id | Delete a goal (owned by user) |

