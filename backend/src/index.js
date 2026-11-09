import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { pool, uploadsDir } from './config/db.js';
import { requireAuth } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import packageRoutes from './routes/packages.js';
import categoryRoutes from './routes/categories.js';
import bookingRoutes from './routes/bookings.js';
import blogRoutes from './routes/blog.js';
import testimonialRoutes from './routes/testimonials.js';
import mediaRoutes from './routes/media.js';
import settingsRoutes from './routes/settings.js';
import inquiryRoutes from './routes/inquiries.js';
import dashboardRoutes from './routes/dashboard.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

fs.mkdirSync(path.join(uploadsDir, 'media'), { recursive: true });
app.use('/uploads', express.static(uploadsDir, { maxAge: '7d' }));

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'supreme-himalayas-api' }));

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/blog-posts', blogRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);

app.use('/api/admin', (req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

const port = Number(process.env.PORT || 4000);

async function checkDb() {
  await pool.query('SELECT 1');
  console.log('Database connection OK');
}
checkDb().then(() => {
  app.listen(port, () => console.log(`Supreme Himalayas API listening on http://localhost:${port}`));
}).catch((err) => {
  console.error('Cannot connect to database:', err.message);
  console.error('Is the MySQL container running? Run: docker compose up -d');
  process.exit(1);
});