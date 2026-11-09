import { Router } from 'express';
import { pool } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/helpers.js';

const router = Router();

router.get('/', requireAuth(), asyncHandler(async (req, res) => {
  const [packages] = await pool.query("SELECT COUNT(*) AS c, SUM(status='published') AS published FROM packages");
  const [bookings] = await pool.query("SELECT COUNT(*) AS c, SUM(status='new') AS new FROM bookings");
  const [inquiries] = await pool.query('SELECT COUNT(*) AS c FROM inquiries');
  const [recentBookings] = await pool.query(
    `SELECT b.id, b.customer_name, b.email, b.booking_ref, b.status, b.payment_status, b.created_at, p.title AS package_title
     FROM bookings b LEFT JOIN packages p ON p.id = b.package_id
     ORDER BY b.created_at DESC LIMIT 5`
  );
  const [thisMonth] = await pool.query(
    `SELECT COUNT(*) AS c FROM bookings
     WHERE created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')`
  );
  const [featuredCount] = await pool.query(
    "SELECT COUNT(*) AS c FROM packages WHERE featured = 1 AND status = 'published'"
  );
  res.json({
    package_count: packages[0].c,
    published_count: packages[0].published,
    bookings_count: bookings[0].c,
    new_bookings_count: bookings[0].new,
    inquiries_count: inquiries[0].c,
    bookings_this_month: thisMonth[0].c,
    featured_count: featuredCount[0].c,
    recent_bookings: recentBookings,
  });
}));

export default router;