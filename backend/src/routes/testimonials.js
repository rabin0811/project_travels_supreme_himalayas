import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/helpers.js';

const router = Router();

const SELECT = `
  SELECT t.*, COALESCE(p.title, '') AS package_title
  FROM testimonials t
  LEFT JOIN packages p ON p.id = t.package_id
`;

/* public: only approved reviews (optionally for one package) */
router.get('/', asyncHandler(async (req, res) => {
  const { package_id } = req.query;
  const params = [];
  let where = 't.status = ?';
  params.push('approved');
  if (package_id) {
    where += ' AND t.package_id = ?';
    params.push(Number(package_id));
  }
  const [rows] = await pool.query(`${SELECT} WHERE ${where} ORDER BY t.created_at DESC`, params);
  res.json(rows);
}));

/* admin: everything, including pending (moderation queue) */
router.get('/admin', requireAuth(), asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`${SELECT} ORDER BY t.status = 'pending' DESC, t.created_at DESC`);
  res.json(rows);
}));

/* public review submission — lands in the moderation queue
   (when submitted by an authenticated admin, it is approved immediately) */
router.post('/', asyncHandler(async (req, res) => {
  const t = req.body || {};
  const header = req.headers.authorization || '';
  let fromAdmin = false;
  if (header.startsWith('Bearer ')) {
    try { jwt.verify(header.slice(7), process.env.JWT_SECRET); fromAdmin = true; } catch {}
  }
  const name = String(t.name || '').trim();
  const review = String(t.review || '').trim();
  if (!name || !review) return res.status(400).json({ error: 'Name and review are required' });
  if (name.length > 120) return res.status(400).json({ error: 'Name is too long' });
  let rating = Number(t.rating) || 5;
  rating = Math.min(5, Math.max(1, Math.round(rating)));
  const packageId = Number(t.package_id) || null;
  if (packageId) {
    const [pkg] = await pool.query('SELECT id FROM packages WHERE id = ?', [packageId]);
    if (!pkg.length) return res.status(400).json({ error: 'Package not found' });
  }
  const status = fromAdmin ? 'approved' : 'pending';
  const [r] = await pool.query(
    'INSERT INTO testimonials (name, country, review, rating, photo, package_id, status) VALUES (?,?,?,?,?,?,?)',
    [name, String(t.country || '').trim().slice(0, 80), review.slice(0, 2000), rating, String(t.photo || '').slice(0, 400), packageId, status]
  );
  res.status(201).json({ id: r.insertId, status });
}));

/* admin: update fields and/or approve/reject */
router.put('/:id', requireAuth(), asyncHandler(async (req, res) => {
  const t = req.body || {};
  const current = await pool.query('SELECT * FROM testimonials WHERE id = ?', [req.params.id]);
  if (!current[0].length) return res.status(404).json({ error: 'Testimonial not found' });
  const prev = current[0][0];
  const name = t.name !== undefined ? String(t.name).trim() : prev.name;
  const review = t.review !== undefined ? String(t.review).trim() : prev.review;
  if (!name || !review) return res.status(400).json({ error: 'Name and review are required' });
  const status = t.status !== undefined ? String(t.status) : prev.status;
  if (!['pending', 'approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const packageId = t.package_id !== undefined ? (Number(t.package_id) || null) : prev.package_id;
  await pool.query(
    'UPDATE testimonials SET name = ?, country = ?, review = ?, rating = ?, photo = ?, package_id = ?, status = ? WHERE id = ?',
    [
      name.slice(0, 120),
      t.country !== undefined ? String(t.country).trim().slice(0, 80) : prev.country,
      review.slice(0, 2000),
      t.rating !== undefined ? Math.min(5, Math.max(1, Math.round(Number(t.rating) || 5))) : prev.rating,
      t.photo !== undefined ? String(t.photo).slice(0, 400) : prev.photo,
      packageId,
      status,
      req.params.id,
    ]
  );
  res.json({ ok: true });
}));

router.delete('/:id', requireAuth(['admin']), asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
  res.json({ success: true });
}));

export default router;