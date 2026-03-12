const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const connectionString = process.env.DATABASE_URL;
const fallbackPassword = String(process.env.PG_PASS || process.env.PGPASSWORD || '');

let poolConfig;
if (connectionString) {
  // Parse URL ourselves so password is always a string for pg.
  try {
    const parsed = new URL(connectionString);
    poolConfig = {
      user: decodeURIComponent(parsed.username || process.env.PG_USER || 'postgres'),
      password: String(decodeURIComponent(parsed.password || fallbackPassword)),
      host: parsed.hostname || process.env.PG_HOST || 'localhost',
      port: Number(parsed.port || process.env.PG_PORT || 5432),
      database: parsed.pathname ? parsed.pathname.replace(/^\//, '') : process.env.PG_DATABASE || 'my_first_project'
    };
  } catch (err) {
    console.warn('Invalid DATABASE_URL format, falling back to PG_* variables.');
    poolConfig = {
      user: process.env.PG_USER || 'postgres',
      password: fallbackPassword,
      host: process.env.PG_HOST || 'localhost',
      port: Number(process.env.PG_PORT || 5432),
      database: process.env.PG_DATABASE || 'my_first_project'
    };
  }
} else {
  poolConfig = {
    user: process.env.PG_USER || 'postgres',
    password: fallbackPassword,
    host: process.env.PG_HOST || 'localhost',
    port: Number(process.env.PG_PORT || 5432),
    database: process.env.PG_DATABASE || 'my_first_project'
  };
}

const pool = new Pool(poolConfig);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;


// make pool available to routes via app.locals
app.locals.pool = pool;

// static frontend
app.use(express.static(path.join(__dirname, 'frontend')));

// routes
app.use('/api/users', require('./routes/users'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/exercises', require('./routes/exercises'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'server error' });
});

app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});

module.exports = app;
