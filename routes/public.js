const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

function stripHtml(input) {
  if (typeof input !== 'string') return '';
  return input.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

// GET /api/public/exercises/:id/info
// Combines: DB exercise_name + public API data from wger.de
router.get('/exercises/:id/info', authMiddleware, async (req, res) => {
  const pool = req.app.locals.pool;

  try {
    const db = await pool.query(
      'SELECT e.exercise_id, e.exercise_name FROM exercises e JOIN workouts w ON e.workout_id=w.workout_id WHERE e.exercise_id=$1 AND w.user_id=$2',
      [req.params.id, req.user.user_id]
    );
    const exercise = db.rows[0];
    if (!exercise) return res.status(404).json({ error: 'not found' });

    const term = exercise.exercise_name;
    const url = `https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(term)}`;
    const response = await fetch(url, {
      headers: { Accept: 'application/json' }
    });

    if (!response.ok) {
      return res.status(500).json({ error: 'public api request failed' });
    }

    const data = await response.json();
    const first = data && Array.isArray(data.suggestions) ? data.suggestions[0] : null;

    if (!first) {
      return res.status(200).json({
        exercise_id: exercise.exercise_id,
        exercise_name: exercise.exercise_name,
        source: 'wger',
        match: null
      });
    }

    // wger search returns a mixed structure; keep it small and UI-friendly
    res.status(200).json({
      exercise_id: exercise.exercise_id,
      exercise_name: exercise.exercise_name,
      source: 'wger',
      match: {
        value: first.value || null,
        data: {
          category: first.data && first.data.category ? first.data.category : null,
          description: stripHtml(first.data && first.data.description ? first.data.description : ''),
          muscles: first.data && Array.isArray(first.data.muscles) ? first.data.muscles : [],
          muscles_secondary: first.data && Array.isArray(first.data.muscles_secondary) ? first.data.muscles_secondary : []
        }
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
