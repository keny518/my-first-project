const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

function normalizeExerciseInput(body) {
  const exercise_name = typeof body.exercise_name === 'string' ? body.exercise_name.trim() : '';
  const setsValue = Number(body.sets);
  const repsValue = Number(body.reps);
  const weightValue = Number(body.weight);

  return {
    exercise_name,
    sets: Number.isFinite(setsValue) ? setsValue : null,
    reps: Number.isFinite(repsValue) ? repsValue : null,
    weight: Number.isFinite(weightValue) ? weightValue : null
  };
}

// GET /api/exercises?workout_id=...
router.get('/', authMiddleware, async (req, res) => {
  const pool = req.app.locals.pool;
  const workout_id = req.query.workout_id;
  try {
    if (!workout_id) return res.status(400).json({ error: 'workout_id required' });
    // ensure workout belongs to user
    const w = await pool.query('SELECT * FROM workouts WHERE workout_id=$1 AND user_id=$2', [workout_id, req.user.user_id]);
    if (!w.rows[0]) return res.status(404).json({ error: 'workout not found or unauthorized' });
    const result = await pool.query('SELECT * FROM exercises WHERE workout_id=$1', [workout_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/exercises
router.post('/', authMiddleware, async (req, res) => {
  const pool = req.app.locals.pool;
  const workout_id = Number(req.body.workout_id);
  const { exercise_name, sets, reps, weight } = normalizeExerciseInput(req.body);
  if (!Number.isInteger(workout_id) || workout_id <= 0) return res.status(400).json({ error: 'valid workout_id is required' });
  if (!exercise_name) return res.status(400).json({ error: 'exercise_name is required' });
  if (!Number.isInteger(sets) || sets <= 0) return res.status(400).json({ error: 'sets must be a positive integer' });
  if (!Number.isInteger(reps) || reps <= 0) return res.status(400).json({ error: 'reps must be a positive integer' });
  if (weight !== null && weight < 0) return res.status(400).json({ error: 'weight cannot be negative' });
  try {
    const w = await pool.query('SELECT * FROM workouts WHERE workout_id=$1 AND user_id=$2', [workout_id, req.user.user_id]);
    if (!w.rows[0]) return res.status(404).json({ error: 'workout not found or unauthorized' });
    const result = await pool.query(
      'INSERT INTO exercises (workout_id, exercise_name, sets, reps, weight) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [workout_id, exercise_name, sets || null, reps || null, weight || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/exercises/:id
router.put('/:id', authMiddleware, async (req, res) => {
  const pool = req.app.locals.pool;
  const { exercise_name, sets, reps, weight } = normalizeExerciseInput(req.body);
  if (!exercise_name) return res.status(400).json({ error: 'exercise_name is required' });
  if (!Number.isInteger(sets) || sets <= 0) return res.status(400).json({ error: 'sets must be a positive integer' });
  if (!Number.isInteger(reps) || reps <= 0) return res.status(400).json({ error: 'reps must be a positive integer' });
  if (weight !== null && weight < 0) return res.status(400).json({ error: 'weight cannot be negative' });
  try {
    // ensure exercise belongs to a workout owned by user
    const ex = await pool.query('SELECT e.* FROM exercises e JOIN workouts w ON e.workout_id=w.workout_id WHERE e.exercise_id=$1 AND w.user_id=$2', [req.params.id, req.user.user_id]);
    if (!ex.rows[0]) return res.status(404).json({ error: 'not found or unauthorized' });
    const result = await pool.query(
      'UPDATE exercises SET exercise_name=$1, sets=$2, reps=$3, weight=$4 WHERE exercise_id=$5 RETURNING *',
      [exercise_name, sets, reps, weight, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/exercises/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const result = await pool.query('DELETE FROM exercises WHERE exercise_id=$1 AND workout_id IN (SELECT workout_id FROM workouts WHERE user_id=$2) RETURNING *', [req.params.id, req.user.user_id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'not found or unauthorized' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
