require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const connectionString = process.env.DATABASE_URL;
const fallbackPassword = process.env.PG_PASS || process.env.PGPASSWORD || undefined;

let poolConfig;
if (connectionString) {
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
      password: process.env.PG_PASS || 'yourpassword',
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

if (poolConfig && poolConfig.password === '') {
  delete poolConfig.password;
}

const pool = new Pool(poolConfig);
console.log('pg poolConfig password type:', typeof poolConfig.password, poolConfig.password === undefined ? 'undefined' : (poolConfig.password === '' ? 'empty' : 'masked'));

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;


app.locals.pool = pool;

app.use(express.static(path.join(__dirname, 'frontend')));

app.use('/api/users', require('./routes/users'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/exercises', require('./routes/exercises'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'server error' });
});

async function startServer() {
  try {
    await pool.query('SELECT 1');
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Database connection failed. Set PGPASSWORD (or PG_PASS) in .env or provide a valid DATABASE_URL.');
    console.error(err.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
