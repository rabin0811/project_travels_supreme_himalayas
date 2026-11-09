import { Router } from 'express';
import { pool } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, generateBookingRef } from '../utils/helpers.js';

const router = Router();

router.get('/', requireAuth(), asyncHandler(async (req, res) => {
  const status = req.query.status;
  const [rows] = await pool.query(
    `SELECT b.*, p.title AS package_title, p.slug AS package_slug
     FROM bookings b LEFT JOIN packages p ON p.id = b.package_id
     ${status ? 'WHERE b.status = ?' : ''}
     ORDER BY b.created_at DESC`,
    status ? [status] : []
  );
  res.json(rows);
}));

router.post('/', asyncHandler(async (req, res) => {
  const b = req.body;
  if (!b.customer_name || !b.email || !b.phone || !b.travel_date) {
    return res.status(400).json({ error: 'Name, email, phone and travel date are required' });
  }
  let ref;
  for (let attempt = 0; attempt < 5; attempt++) {
    ref = generateBookingRef();
    const [exists] = await pool.query('SELECT id FROM bookings WHERE booking_ref = ?', [ref]);
    if (!exists[0]) break;
  }
  const [r] = await pool.query(
    `INSERT INTO bookings
     (package_id, customer_name, email, phone, country, travel_date, travelers_count, special_requests, status, payment_status, booking_ref)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [
      b.package_id || null, b.customer_name, b.email, b.phone, b.country || '',
      b.travel_date, b.travelers_count || 1, b.special_requests || '',
      'new', 'unpaid', ref,
    ]
  );
  res.status(201).json({ id: r.insertId, booking_ref: ref, status: 'new', payment_status: 'unpaid' });
}));

router.patch('/:id', requireAuth(), asyncHandler(async (req, res) => {
  const allowed = ['status', 'payment_status'];
  const fields = Object.keys(req.body).filter((k) => allowed.includes(k));
  if (!fields.length) return res.status(400).json({ error: 'No updatable fields provided' });
  const sets = fields.map((f) => `${f} = ?`);
  const values = fields.map((f) => req.body[f]);
  await pool.query(`UPDATE bookings SET ${sets.join(', ')} WHERE id = ?`, [...values, req.params.id]);
  const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
  res.json(rows[0]);
}));

router.delete('/:id', requireAuth(['admin']), asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM bookings WHERE id = ?', [req.params.id]);
  res.json({ success: true });
}));

export default router;