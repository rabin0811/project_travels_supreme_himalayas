import { Router } from 'express';
import { pool } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, slugify } from '../utils/helpers.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT c.id, c.name, c.slug, c.parent_id,
            (SELECT COUNT(*) FROM packages p WHERE p.category_id = c.id AND p.status = 'published') AS package_count
     FROM categories c ORDER BY c.name ASC`
  );
  res.json(rows);
}));

router.get('/:slug/packages', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT p.id, p.title, p.slug, p.price, p.duration, p.grade, p.short_description, p.gallery_images, p.featured
     FROM packages p JOIN categories c ON c.id = p.category_id
     WHERE p.status = 'published' AND (c.slug = ? OR c.parent_id = (SELECT id FROM categories WHERE slug = ?))
     ORDER BY p.created_at DESC`,
    [req.params.slug, req.params.slug]
  );
  res.json((rows[0] || rows).length > 0 && Array.isArray(rows[0]) ? rows[0] : rows);
}));

router.post('/', requireAuth(['admin']), asyncHandler(async (req, res) => {
  const { name, parent_id } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const slug = slugify(name);
  try {
    const [r] = await pool.query('INSERT INTO categories (name, slug, parent_id) VALUES (?,?,?)', [name, slug, parent_id || null]);
    res.status(201).json({ id: r.insertId, name, slug });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'A category with this name already exists' });
    throw err;
  }
}));

router.put('/:id', requireAuth(['admin']), asyncHandler(async (req, res) => {
  const { name, parent_id } = req.body;
  const slug = slugify(name || '');
  await pool.query('UPDATE categories SET name = ?, slug = ?, parent_id = ? WHERE id = ?', [name, slug, parent_id || null, req.params.id]);
  res.json({ ok: true });
}));

router.delete('/:id', requireAuth(['admin']), asyncHandler(async (req, res) => {
  const [count] = await pool.query('SELECT COUNT(*) AS c FROM packages WHERE category_id = ?', [req.params.id]);
  if (count[0].c > 0) {
    return res.status(409).json({ error: 'Category still has packages. Move or delete those first.' });
  }
  await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
  res.json({ success: true });
}));

export default router;