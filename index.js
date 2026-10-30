const express = require('express');
const { Pool } = require('pg');
const app = express();
app.use(express.json());
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const HOST = process.env.HOSTNAME;

(async () => {
  await pool.query('CREATE TABLE IF NOT EXISTS scores (id SERIAL PRIMARY KEY, player TEXT NOT NULL, score INT NOT NULL, created_at TIMESTAMP DEFAULT NOW())');
})();

app.get('/health', async (req, res) => {
  try { await pool.query('SELECT 1'); res.json({ status: 'OK', host: HOST }); }
  catch (e) { res.status(500).json({ status: 'ERROR', host: HOST }); }
});

app.post('/snake/score', async (req, res) => {
  const { player, score } = req.body;
  await pool.query('INSERT INTO scores (player, score) VALUES ($1, $2)', [player, score]);
  res.json({ ok: true, host: HOST });
});

app.get('/snake/scores', async (req, res) => {
  const r = await pool.query('SELECT player, score FROM scores ORDER BY score DESC LIMIT 10');
  res.json({ host: HOST, scores: r.rows });
});

app.listen(3000, () => console.log('API on 3000'));