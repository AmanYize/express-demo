const express = require('express');
const { Pool } = require('pg');
const client = require('prom-client');

const app = express();
const port = process.env.PORT || 3000;

// PostgreSQL connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',    // <-- changed here
  database: 'mydb',
  password: process.env.POSTGRES_PASSWORD,
  port: 5433,           // Docker postgres mapped port
});


// Prometheus metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({ method: req.method, route: req.path, status: res.statusCode });
  });
  next();
});

// Routes
app.get('/hello', async (req, res) => {
  try {
    await pool.query('CREATE TABLE IF NOT EXISTS visits (id SERIAL PRIMARY KEY, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');
    await pool.query('INSERT INTO visits (timestamp) VALUES (CURRENT_TIMESTAMP)');
    const result = await pool.query('SELECT COUNT(*) FROM visits');
    res.json({ message: 'Hello, World!', visitCount: result.rows[0].count });
  } catch (err) {
   
    res.status(500).json({ error: 'Database error', message: err.message, full_error: err });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});