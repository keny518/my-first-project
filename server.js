const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL || process.env.PG_URI || 'postgresql://localhost:5432/my_first_project';

const pool = new Pool({ connectionString: DATABASE_URL });

// make pool available to routes via app.locals
app.locals.pool = pool;

// static frontend
app.use(express.static(path.join(__dirname, 'frontend')));

// routes
app.use('/api/users', require('./routes/users'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/exercises', require('./routes/exercises'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});

module.exports = app;
