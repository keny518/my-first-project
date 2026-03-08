const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

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
  const { workout_date, workout_type, duration_minutes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO workouts (user_id, workout_date, workout_type, duration_minutes) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.user.user_id, workout_date || new Date(), workout_type || null, duration_minutes || null]
    );
    res.json(result.rows[0]);
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

// PUT /api/workouts/:id
router.put('/:id', authMiddleware, async (req, res) => {
  const pool = req.app.locals.pool;
  const { workout_date, workout_type, duration_minutes } = req.body;
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
    await pool.query('DELETE FROM exercises WHERE workout_id=$1', [req.params.id]);
    const result = await pool.query('DELETE FROM workouts WHERE workout_id=$1 AND user_id=$2 RETURNING *', [req.params.id, req.user.user_id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'not found or unauthorized' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
