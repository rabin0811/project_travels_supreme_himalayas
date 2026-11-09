import { Router } from 'express';
import { pool } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, slugify } from '../utils/helpers.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const isAdmin = !!req.headers.authorization?.startsWith('Bearer ');
  const [rows] = await pool.query(
    `SELECT id, title, slug, featured_image, published_at, created_at
     FROM blog_posts ${isAdmin ? '' : 'WHERE published_at IS NOT NULL AND published_at <= NOW()'}
     ORDER BY published_at DESC`
  );
  res.json(rows);
}));

router.get('/:slug', asyncHandler(async (req, res) => {
  const isAdmin = !!req.headers.authorization?.startsWith('Bearer ');
  const rows = await pool.query(
    `SELECT * FROM blog_posts WHERE slug = ? ${isAdmin ? '' : 'AND published_at IS NOT NULL AND published_at <= NOW()'}`,
    [req.params.slug]
  );
  const post = rows[0][0];
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
}));

router.post('/', requireAuth(), asyncHandler(async (req, res) => {
  const b = req.body;
  const baseSlug = slugify(b.title) || Math.random().toString(36).slice(2);
  let slug = baseSlug;
  const [dup] = await pool.query('SELECT id FROM blog_posts WHERE slug = ?', [slug]);
  if (dup[0]) slug = `${baseSlug}-${Date.now().toString(36)}`;
  const [r] = await pool.query(
    'INSERT INTO blog_posts (title, slug, content, featured_image, published_at, heading_color) VALUES (?,?,?,?,?,?)',
    [b.title, slug, b.content || '', b.featured_image || '', b.published_at ? new Date(b.published_at) : new Date(), b.heading_color || null]
  );
  res.status(201).json({ id: r.insertId, slug });
}));

router.put('/:id', requireAuth(), asyncHandler(async (req, res) => {
  const b = req.body;
  const slug = b.slug ? slugify(b.slug) : slugify(b.title);
  await pool.query(
    'UPDATE blog_posts SET title = ?, slug = ?, content = ?, featured_image = ?, published_at = ?, heading_color = ? WHERE id = ?',
    [b.title, slug, b.content || '', b.featured_image || '', b.published_at ? new Date(b.published_at) : null, b.heading_color || null, req.params.id]
  );
  res.json({ ok: true });
}));

router.delete('/:id', requireAuth(['admin']), asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM blog_posts WHERE id = ?', [req.params.id]);
  res.json({ success: true });
}));

export default router;