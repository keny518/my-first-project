require('dotenv').config();
const { Pool } = require('pg');

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

if (poolConfig && poolConfig.password === '') {
  delete poolConfig.password;
}

console.log('poolConfig password type:', typeof poolConfig.password, poolConfig.password === undefined ? 'undefined' : (poolConfig.password === '' ? 'empty' : 'masked'));

const pool = new Pool(poolConfig);

pool.query('SELECT 1').then(res => {
  console.log('query ok', res.rows);
}).catch(err => {
  console.error('query error:', err && err.message);
  console.error(err);
}).finally(() => pool.end());
