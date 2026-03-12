const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      user: process.env.PG_USER || 'postgres',
      password: String(process.env.PG_PASS || ''),
      host: process.env.PG_HOST || 'localhost',
      port: Number(process.env.PG_PORT || 5432),
      database: process.env.PG_DATABASE || 'my_first_project'
    };

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
