import { pool } from '../config/db.js';

const schema = `
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  parent_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS packages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  category_id INT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration VARCHAR(50) NOT NULL DEFAULT '',
  grade VARCHAR(50) NOT NULL DEFAULT '',
  short_description TEXT,
  full_description MEDIUMTEXT,
  itinerary JSON,
  includes JSON,
  excludes JSON,
  fixed_departure_dates JSON,
  gallery_images JSON,
  map_embed_url VARCHAR(500) DEFAULT '',
  status ENUM('draft','published') NOT NULL DEFAULT 'draft',
  featured TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  KEY idx_category (category_id),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(60) DEFAULT '',
  package_id INT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL,
  KEY idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  package_id INT NULL,
  customer_name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(60) NOT NULL,
  country VARCHAR(80) DEFAULT '',
  travel_date DATE NOT NULL,
  travelers_count INT NOT NULL DEFAULT 1,
  special_requests TEXT,
  status ENUM('new','contacted','confirmed','closed') NOT NULL DEFAULT 'new',
  payment_status ENUM('unpaid','deposit_paid','paid') NOT NULL DEFAULT 'unpaid',
  booking_ref VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL,
  KEY idx_status (status),
  KEY idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  content MEDIUMTEXT,
  featured_image VARCHAR(400) DEFAULT '',
  published_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_published (published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  country VARCHAR(80) DEFAULT '',
  review TEXT,
  rating TINYINT NOT NULL DEFAULT 5,
  photo VARCHAR(400) DEFAULT '',
  package_id INT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_test_status (status),
  KEY idx_test_package (package_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  password_hash VARCHAR(200) NOT NULL,
  role ENUM('admin','editor') NOT NULL DEFAULT 'editor',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS settings (
  \`key\` VARCHAR(100) PRIMARY KEY,
  \`value\` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

async function main() {
  const conn = await pool.getConnection();
  try {
    for (const stmt of schema.split(';').map((s) => s.trim()).filter(Boolean)) {
      await conn.query(stmt);
    }
    /* upgrade existing installs: add moderation columns + one-time auto-approve of existing rows */
    const [cols] = await conn.query(
      `SELECT COUNT(*) AS c FROM information_schema.columns
       WHERE table_schema = DATABASE() AND table_name = 'testimonials' AND column_name IN ('status','package_id')`
    );
    if (cols[0].c < 2) {
      await conn.query("ALTER TABLE testimonials ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending'");
      await conn.query('ALTER TABLE testimonials ADD COLUMN package_id INT NULL');
    } else {
      await conn.query("ALTER TABLE testimonials MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending'");
    }
    const [flag] = await conn.query(
      'INSERT INTO settings (`key`, `value`) VALUES (\'_reviews_migrated\', \'1\') ON DUPLICATE KEY UPDATE `key` = `key`'
    );
    if (flag.affectedRows === 1) {
      await conn.query("UPDATE testimonials SET status = 'approved'");
      console.log('Reviews migration: existing testimonials marked approved');
    }
    /* blog heading color + package route waypoints */
    const [cols2] = await conn.query(
      `SELECT COUNT(*) AS c FROM information_schema.columns
       WHERE table_schema = DATABASE() AND table_name = 'blog_posts' AND column_name = 'heading_color'`
    );
    if (cols2[0].c === 0) await conn.query('ALTER TABLE blog_posts ADD COLUMN heading_color VARCHAR(9) NULL');
    const [cols3] = await conn.query(
      `SELECT COUNT(*) AS c FROM information_schema.columns
       WHERE table_schema = DATABASE() AND table_name = 'packages' AND column_name = 'route_points'`
    );
    if (cols3[0].c === 0) await conn.query('ALTER TABLE packages ADD COLUMN route_points JSON NULL');
    /* default USD -> NPR exchange rate (editable in Admin -> Settings) */
    await conn.query(
      "INSERT INTO settings (`key`, `value`) VALUES ('exchange_rate', '134') ON DUPLICATE KEY UPDATE `key` = `key`"
    );
    console.log('Schema ready: categories, packages, inquiries, bookings, blog_posts, testimonials, admin_users, settings');
  } finally {
    conn.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Schema init failed:', err.message);
  process.exit(1);
});