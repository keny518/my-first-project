# Endpoint Testing (curl)

Assumes:
- server running on `http://localhost:3000`
- you will paste a real JWT into `TOKEN`

## Auth

### Register

```bash
curl -i -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Login

```bash
curl -i -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Set your token:

```bash
TOKEN="PASTE_TOKEN_HERE"
```

### Me

```bash
curl -i http://localhost:3000/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```

## Workouts

### Create workout (POST)

```bash
curl -i -X POST http://localhost:3000/api/workouts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"workout_date":"2026-04-16","workout_type":"Strength Training","duration_minutes":45}'
```

### List workouts (GET all)

```bash
curl -i http://localhost:3000/api/workouts \
  -H "Authorization: Bearer $TOKEN"
```

### Get one workout (GET one)

```bash
curl -i http://localhost:3000/api/workouts/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Update workout (PUT)

```bash
curl -i -X PUT http://localhost:3000/api/workouts/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"workout_date":"2026-04-16","workout_type":"HIIT","duration_minutes":30}'
```

### Delete workout (DELETE)

```bash
curl -i -X DELETE http://localhost:3000/api/workouts/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Sub-resource: exercises for workout

```bash
curl -i http://localhost:3000/api/workouts/1/exercises \
  -H "Authorization: Bearer $TOKEN"
```

## Exercises

### Create exercise (POST)

```bash
curl -i -X POST http://localhost:3000/api/exercises \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"workout_id":1,"exercise_name":"Squat","sets":3,"reps":5,"weight":225}'
```

### List exercises (GET all)

```bash
curl -i http://localhost:3000/api/exercises \
  -H "Authorization: Bearer $TOKEN"
```

### List exercises for workout (GET filtered)

```bash
curl -i "http://localhost:3000/api/exercises?workout_id=1" \
  -H "Authorization: Bearer $TOKEN"
```

### Get one exercise (GET one)

```bash
curl -i http://localhost:3000/api/exercises/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Update exercise (PUT)

```bash
curl -i -X PUT http://localhost:3000/api/exercises/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"exercise_name":"Squat","sets":4,"reps":5,"weight":235}'
```

### Delete exercise (DELETE)

```bash
curl -i -X DELETE http://localhost:3000/api/exercises/1 \
  -H "Authorization: Bearer $TOKEN"
```

## Goals

### Create goal (POST)

```bash
curl -i -X POST http://localhost:3000/api/goals \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"goal_title":"Train consistently","target_workouts_per_week":3}'
```

### List goals (GET all)

```bash
curl -i http://localhost:3000/api/goals \
  -H "Authorization: Bearer $TOKEN"
```

### Get one goal (GET one)

```bash
curl -i http://localhost:3000/api/goals/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Update goal (PUT)

```bash
curl -i -X PUT http://localhost:3000/api/goals/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"goal_title":"Train 4x/week","target_workouts_per_week":4}'
```

### Delete goal (DELETE)

```bash
curl -i -X DELETE http://localhost:3000/api/goals/1 \
  -H "Authorization: Bearer $TOKEN"
```

## Public API proxy

This endpoint looks up the exercise in **your DB**, then queries `wger.de` to enrich it.

```bash
curl -i http://localhost:3000/api/public/exercises/1/info \
  -H "Authorization: Bearer $TOKEN"
```

## Quick failure tests

Missing token:

```bash
curl -i http://localhost:3000/api/workouts
```

Bad body:

```bash
curl -i -X POST http://localhost:3000/api/workouts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```
