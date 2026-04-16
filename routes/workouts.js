const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

function normalizeWorkoutInput(body) {
  const workout_type = typeof body.workout_type === 'string' ? body.workout_type.trim() : '';
  const workout_date = body.workout_date || null;
  const duration = body.duration_minutes;
  const duration_minutes = Number.isFinite(Number(duration)) ? Number(duration) : null;
  return { workout_type, workout_date, duration_minutes };
}

// GET /api/workouts - list workouts for user
router.get('/', authMiddleware, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const result = await pool.query('SELECT * FROM workouts WHERE user_id=$1 ORDER BY workout_date DESC', [req.user.user_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/workouts - create
router.post('/', authMiddleware, async (req, res) => {
  const pool = req.app.locals.pool;
  const { workout_date, workout_type, duration_minutes } = normalizeWorkoutInput(req.body);
  if (!workout_type) return res.status(400).json({ error: 'workout_type is required' });
  if (!workout_date) return res.status(400).json({ error: 'workout_date is required' });
  if (!Number.isInteger(duration_minutes) || duration_minutes <= 0) {
    return res.status(400).json({ error: 'duration_minutes must be a positive integer' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO workouts (user_id, workout_date, workout_type, duration_minutes) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.user.user_id, workout_date, workout_type, duration_minutes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/workouts/:id
router.get('/:id', authMiddleware, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const result = await pool.query('SELECT * FROM workouts WHERE workout_id=$1 AND user_id=$2', [req.params.id, req.user.user_id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/workouts/:id/exercises - sub-resource: exercises in a workout
router.get('/:id/exercises', authMiddleware, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const workout = await pool.query(
      'SELECT workout_id FROM workouts WHERE workout_id=$1 AND user_id=$2',
      [req.params.id, req.user.user_id]
    );
    if (!workout.rows[0]) return res.status(404).json({ error: 'not found' });

    const result = await pool.query(
      'SELECT * FROM exercises WHERE workout_id=$1 ORDER BY exercise_id ASC',
      [req.params.id]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/workouts/:id
router.put('/:id', authMiddleware, async (req, res) => {
  const pool = req.app.locals.pool;
  const { workout_date, workout_type, duration_minutes } = normalizeWorkoutInput(req.body);
  if (!workout_type) return res.status(400).json({ error: 'workout_type is required' });
  if (!workout_date) return res.status(400).json({ error: 'workout_date is required' });
  if (!Number.isInteger(duration_minutes) || duration_minutes <= 0) {
    return res.status(400).json({ error: 'duration_minutes must be a positive integer' });
  }
  try {
    const result = await pool.query(
      'UPDATE workouts SET workout_date=$1, workout_type=$2, duration_minutes=$3 WHERE workout_id=$4 AND user_id=$5 RETURNING *',
      [workout_date, workout_type, duration_minutes, req.params.id, req.user.user_id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'not found or unauthorized' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/workouts/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const result = await pool.query(
      'DELETE FROM workouts WHERE workout_id=$1 AND user_id=$2 RETURNING *',
      [req.params.id, req.user.user_id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'not found or unauthorized' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
