import { Router } from 'express';
import { pool } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/helpers.js';

const router = Router();

/* live USD -> NPR rate from a free service (open.er-api.com, no key needed) */
router.get('/live-rate', asyncHandler(async (req, res) => {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/USD', { signal: ctrl.signal });
    const data = await r.json();
    const rate = Number(data?.rates?.NPR);
    if (!rate) return res.status(502).json({ error: 'Live rate unavailable right now' });
    res.json({
      rate,
      date: data.time_last_update_utc || null,
      source: 'open.er-api.com',
    });
  } catch {
    res.status(502).json({ error: 'Could not reach the exchange-rate service' });
  } finally {
    clearTimeout(timer);
  }
}));

router.get('/', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT \`key\`, \`value\` FROM settings');
  const settings = {};
  for (const r of rows) settings[r.key] = r.value;
  res.json(settings);
}));

router.put('/', requireAuth(), asyncHandler(async (req, res) => {
  for (const [key, value] of Object.entries(req.body || {})) {
    await pool.query(
      'INSERT INTO settings (\`key\`, \`value\`) VALUES (?,?) ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`)',
      [key, String(value ?? '')]
    );
  }
  const [rows] = await pool.query('SELECT \`key\`, \`value\` FROM settings');
  const settings = {};
  for (const r of rows) settings[r.key] = r.value;
  res.json(settings);
}));

export default router;