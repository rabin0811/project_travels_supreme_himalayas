import { Router } from 'express';
import { pool } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/helpers.js';

const router = Router();

router.get('/', requireAuth(), asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT i.*, p.title AS package_title, p.slug AS package_slug
     FROM inquiries i LEFT JOIN packages p ON p.id = i.package_id
     ORDER BY i.created_at DESC`
  );
  res.json(rows);
}));

router.post('/', asyncHandler(async (req, res) => {
  const i = req.body;
  if (!i.name || !i.email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  const [r] = await pool.query(
    'INSERT INTO inquiries (name, email, phone, package_id, message) VALUES (?,?,?,?,?)',
    [i.name, i.email, i.phone || '', i.package_id || null, i.message || '']
  );
  res.status(201).json({ id: r.insertId });
}));

router.delete('/:id', requireAuth(['admin']), asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM inquiries WHERE id = ?', [req.params.id]);
  res.json({ success: true });
}));

export default router;