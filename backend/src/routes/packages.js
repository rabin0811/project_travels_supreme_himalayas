import { Router } from 'express';
import { pool } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, slugify, parseJson } from '../utils/helpers.js';

const router = Router();

const PACKAGE_COLS = `p.id, p.title, p.slug, p.price, p.duration, p.grade, p.short_description,
  p.gallery_images, p.category_id, p.featured, p.status, c.name AS category_name, c.slug AS category_slug`;

async function nprRate() {
  const [r] = await pool.query("SELECT `value` FROM settings WHERE `key` = 'exchange_rate'");
  const n = Number(r[0]?.value);
  return n > 0 ? n : 134;
}

const withNpr = (rate) => (r) => ({
  ...r,
  price_npr: Math.round(Number(r.price) * rate),
});

function buildWhere(query, isAdmin) {
  const where = [];
  const params = [];

  if (!isAdmin) where.push('p.status = \'published\'');
  if (query.category) {
    where.push('(c.slug = ? OR c.parent_id = (SELECT id FROM categories WHERE slug = ?))');
    params.push(query.category, query.category);
  }
  if (query.q) {
    where.push('(p.title LIKE ? OR p.short_description LIKE ? OR p.full_description LIKE ?)');
    params.push(`%${query.q}%`, `%${query.q}%`, `%${query.q}%`);
  }
  if (query.grade) {
    where.push('LOWER(p.grade) LIKE ?');
    params.push(`%${query.grade}%`);
  }
  if (query.duration_max) {
    const n = parseInt(query.duration_max, 10);
    if (!isNaN(n)) {
      where.push('CAST(REPLACE(REPLACE(p.duration, \' Days\', \'\'), \' Day\', \'\') AS UNSIGNED) <= ?');
      params.push(n);
    }
  }
  if (query.price_min) {
    where.push('p.price >= ?');
    params.push(Number(query.price_min));
  }
  if (query.price_max) {
    where.push('p.price <= ?');
    params.push(Number(query.price_max));
  }
  if (query.featured === '1') where.push('p.featured = 1');
  if (query.status && isAdmin) {
    where.push('p.status = ?');
    params.push(query.status);
  }
  return { where, params };
}

router.get('/', asyncHandler(async (req, res) => {
  const q = req.query;
  const isAdmin = !!req.headers.authorization?.startsWith('Bearer ');
  const { where, params } = buildWhere(q, isAdmin);
  const page = Math.max(1, parseInt(q.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(q.limit, 10) || 12));
  const offset = (page - 1) * limit;

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM packages p LEFT JOIN categories c ON c.id = p.category_id ${whereSql}`,
    params
  );

  let orderBy = 'p.created_at DESC';
  if (q.sort === 'price_asc') orderBy = 'p.price ASC';
  if (q.sort === 'price_desc') orderBy = 'p.price DESC';
  if (q.sort === 'duration') orderBy = 'CAST(REPLACE(REPLACE(p.duration, \' Days\', \'\'), \' Day\', \'\') AS UNSIGNED) ASC';
  if (q.featured === '1') orderBy = 'p.featured DESC, p.created_at DESC';

  const [rows] = await pool.query(
    `SELECT ${PACKAGE_COLS} FROM packages p
     LEFT JOIN categories c ON c.id = p.category_id
     ${whereSql} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const rate = await nprRate();
  const packages = rows.map((r) => withNpr(rate)({ ...r, gallery_images: parseJson(r.gallery_images, []) }));

  res.json({
    packages,
    total: countRows[0].total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(countRows[0].total / limit)),
  });
}));

router.get('/:slug', asyncHandler(async (req, res) => {
  const isAdmin = !!req.headers.authorization?.startsWith('Bearer ');
  const [rows] = await pool.query(
    `SELECT ${PACKAGE_COLS}, p.itinerary, p.includes, p.excludes, p.fixed_departure_dates,
            p.map_embed_url, p.route_points, p.created_at, p.updated_at
     FROM packages p LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.slug = ? ${isAdmin ? '' : 'AND p.status = \'published\''}`,
    [req.params.slug]
  );
  const p = rows[0];
  if (!p) return res.status(404).json({ error: 'Package not found' });
  const rate = await nprRate();
  const related = await pool.query(
    `SELECT ${PACKAGE_COLS} FROM packages p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.status = 'published' AND p.category_id = ? AND p.id != ?
     ORDER BY p.created_at DESC LIMIT 3`,
    [p.category_id, p.id]
  );
  res.json({
    ...withNpr(rate)(p),
    itinerary: parseJson(p.itinerary, []),
    includes: parseJson(p.includes, []),
    excludes: parseJson(p.excludes, []),
    fixed_departure_dates: parseJson(p.fixed_departure_dates, []),
    gallery_images: parseJson(p.gallery_images, []),
    route_points: parseJson(p.route_points, []),
    related: (related[0] || []).map((r) => withNpr(rate)({ ...r, gallery_images: parseJson(r.gallery_images, []) })),
  });
}));

router.post('/', requireAuth(), asyncHandler(async (req, res) => {
  const b = req.body;
  const slug = b.slug ? slugify(b.slug) : slugify(b.title);
  const [result] = await pool.query(
    `INSERT INTO packages
     (title, slug, category_id, price, duration, grade, short_description, full_description,
      itinerary, includes, excludes, fixed_departure_dates, gallery_images, map_embed_url, route_points, status, featured)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      b.title, slug, b.category_id || null, b.price || 0, b.duration || '', b.grade || '',
      b.short_description || '', b.full_description || '',
      JSON.stringify(b.itinerary || []), JSON.stringify(b.includes || []), JSON.stringify(b.excludes || []),
      JSON.stringify(b.fixed_departure_dates || []), JSON.stringify(b.gallery_images || []),
      b.map_embed_url || '', JSON.stringify(b.route_points || []), b.status || 'draft', b.featured ? 1 : 0,
    ]
  );
  res.status(201).json({ id: result.insertId, slug });
}));

router.put('/:id', requireAuth(['admin', 'editor']), asyncHandler(async (req, res) => {
  const b = req.body;
  const [rows] = await pool.query('SELECT id FROM packages WHERE id = ?', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Package not found' });
  const slug = b.slug ? slugify(b.slug) : slugify(b.title);
  await pool.query(
    `UPDATE packages SET
       title = ?, slug = ?, category_id = ?, price = ?, duration = ?, grade = ?,
       short_description = ?, full_description = ?, itinerary = ?, includes = ?, excludes = ?,
       fixed_departure_dates = ?, gallery_images = ?, map_embed_url = ?, route_points = ?, status = ?, featured = ?
     WHERE id = ?`,
    [
      b.title, slug, b.category_id || null, b.price || 0, b.duration || '', b.grade || '',
      b.short_description || '', b.full_description || '',
      JSON.stringify(b.itinerary || []), JSON.stringify(b.includes || []), JSON.stringify(b.excludes || []),
      JSON.stringify(b.fixed_departure_dates || []), JSON.stringify(b.gallery_images || []),
      b.map_embed_url || '', JSON.stringify(b.route_points || []), b.status || 'draft', b.featured ? 1 : 0, req.params.id,
    ]
  );
  res.json({ ok: true, slug });
}));

router.delete('/:id', requireAuth(['admin']), asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM packages WHERE id = ?', [req.params.id]);
  res.json({ success: true });
}));

export default router;