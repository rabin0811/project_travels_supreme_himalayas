#!/bin/sh
set -e

node src/db/init.js

if ! node --input-type=module -e "import { pool } from './src/config/db.js'; const [r] = await pool.query('SELECT id FROM admin_users LIMIT 1'); process.exit(r.length ? 0 : 1);"; then
  node src/db/generate-images.js
  node src/db/seed.js
fi

exec node src/index.js
