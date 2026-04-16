const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

function normalizeGoalInput(body) {
  const goal_title = typeof body.goal_title === 'string' ? body.goal_title.trim() : '';
  const target_workouts_per_week = Number(body.target_workouts_per_week);
  return { goal_title, target_workouts_per_week };
}

// GET /api/goals - list goals for authenticated user
router.get('/', authMiddleware, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const result = await pool.query(
      'SELECT * FROM goals WHERE user_id=$1 ORDER BY created_at DESC',
      [req.user.user_id]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/goals/:id - get one goal owned by user
router.get('/:id', authMiddleware, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const result = await pool.query(
      'SELECT * FROM goals WHERE goal_id=$1 AND user_id=$2',
      [req.params.id, req.user.user_id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'not found' });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/goals - create goal
router.post('/', authMiddleware, async (req, res) => {
  const pool = req.app.locals.pool;
  const { goal_title, target_workouts_per_week } = normalizeGoalInput(req.body);
  if (!goal_title) return res.status(400).json({ error: 'goal_title is required' });
  if (!Number.isInteger(target_workouts_per_week) || target_workouts_per_week <= 0) {
    return res.status(400).json({ error: 'target_workouts_per_week must be a positive integer' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO goals (user_id, goal_title, target_workouts_per_week) VALUES ($1,$2,$3) RETURNING *',
      [req.user.user_id, goal_title, target_workouts_per_week]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/goals/:id - update goal
router.put('/:id', authMiddleware, async (req, res) => {
  const pool = req.app.locals.pool;
  const { goal_title, target_workouts_per_week } = normalizeGoalInput(req.body);
  if (!goal_title) return res.status(400).json({ error: 'goal_title is required' });
  if (!Number.isInteger(target_workouts_per_week) || target_workouts_per_week <= 0) {
    return res.status(400).json({ error: 'target_workouts_per_week must be a positive integer' });
  }

  try {
    const result = await pool.query(
      'UPDATE goals SET goal_title=$1, target_workouts_per_week=$2 WHERE goal_id=$3 AND user_id=$4 RETURNING *',
      [goal_title, target_workouts_per_week, req.params.id, req.user.user_id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'not found or unauthorized' });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/goals/:id - delete goal
router.delete('/:id', authMiddleware, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const result = await pool.query(
      'DELETE FROM goals WHERE goal_id=$1 AND user_id=$2 RETURNING *',
      [req.params.id, req.user.user_id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'not found or unauthorized' });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
