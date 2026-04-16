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
| GET | /api/workouts | Return all workouts|
| GET | /api/workouts/:id | Return one workout by id |
| POST | /api/workouts | Create a workout  |
| PUT | /api/workouts/:id | Update a workout |
| DELETE | /api/workouts/:id | Delete a workout|
| GET | /api/workouts/:id/exercises | return all exercises for a specific workout |
| GET | /api/exercises | Return all exercises|
| GET | /api/exercises/:id | Return one exercise by id |
| POST | /api/exercises | Create an exercise for a workout  |
| PUT | /api/exercises/:id | Update an exercise |
| DELETE | /api/exercises/:id | Delete an exercise |
| GET | /api/goals | Return all goals  |
| GET | /api/goals/:id | Return one goal by id |
| POST | /api/goals | Create a goal|
| PUT | /api/goals/:id | Update a goal|
| DELETE | /api/goals/:id | Delete a goal|

