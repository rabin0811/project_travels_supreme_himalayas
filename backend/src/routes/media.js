import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadsDir } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/helpers.js';

const router = Router();
const mediaDir = path.join(uploadsDir, 'media');
fs.mkdirSync(mediaDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, mediaDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9-_]+/gi, '-');
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 12 * 1024 * 1024 } });

router.get('/', requireAuth(), asyncHandler(async (req, res) => {
  const files = fs.readdirSync(mediaDir)
    .filter((f) => /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(f))
    .map((f) => {
      const s = fs.statSync(path.join(mediaDir, f));
      return { name: f, url: `/uploads/media/${f}`, size: s.size, modifiedAt: s.mtime };
    })
    .sort((a, b) => b.modifiedAt - a.modifiedAt);
  res.json(files);
}));

router.post('/', requireAuth(), upload.array('files', 12), asyncHandler(async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: 'No files uploaded' });
  res.status(201).json(
    req.files.map((f) => ({ name: f.filename, url: `/uploads/media/${f.filename}`, size: f.size }))
  );
}));

router.delete('/:filename', requireAuth(['admin']), asyncHandler(async (req, res) => {
  const safe = path.basename(req.params.filename);
  const filePath = path.join(mediaDir, safe);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
  fs.unlinkSync(filePath);
  res.json({ success: true });
}));

export default router;