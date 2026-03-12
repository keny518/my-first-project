const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { SECRET, authMiddleware } = require('../middleware/auth');

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST /api/users/register
router.post('/register', async (req, res) => {
  const pool = req.app.locals.pool;
  const { name, email, password } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const safeName = typeof name === 'string' ? name.trim() : '';

  if (!isValidEmail(normalizedEmail)) {
    return res.status(400).json({ error: 'valid email is required' });
  }
  if (!safeName) {
    return res.status(400).json({ error: 'name is required' });
  }
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'password must be at least 6 characters' });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING user_id, name, email',
      [safeName, normalizedEmail, hashed]
    );
    const user = result.rows[0];
    const token = jwt.sign({ user_id: user.user_id, name: user.name, email: user.email }, SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'email already exists' });
    res.status(500).json({ error: 'server error', details: err.message });
  }
});

// POST /api/users/login
router.post('/login', async (req, res) => {
  const pool = req.app.locals.pool;
  const { email, password } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!isValidEmail(normalizedEmail) || typeof password !== 'string') {
    return res.status(400).json({ error: 'valid email and password required' });
  }
  try {
    const result = await pool.query('SELECT user_id, name, email, password FROM users WHERE email=$1', [normalizedEmail]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    const token = jwt.sign({ user_id: user.user_id, name: user.name, email: user.email }, SECRET, { expiresIn: '7d' });
    res.json({ user: { user_id: user.user_id, name: user.name, email: user.email }, token });
  } catch (err) {
    res.status(500).json({ error: 'server error', details: err.message });
  }
});

// GET /api/users/me
router.get('/me', authMiddleware, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
