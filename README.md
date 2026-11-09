# project_travels_supreme_himalayas

## Travels Supreme Himalayas

A travel-agency website with a Next.js frontend and an Express/MySQL backend. It includes public pages, booking enquiries, blog content, and an admin area.

- Original location: `D:\projects\Travels`
- Working copy: `D:\PROJECTS_READY\project_travels_supreme_himalayas`
- Frontend: Next.js 15, React 19, Leaflet
- Backend: Node.js, Express 4, MySQL (`mysql2`), JWT

## Folder layout

```text
project_travels_supreme_himalayas/
  frontend/   Next.js public site and admin UI
  backend/    Express API, MySQL init/seed scripts, uploads
  database/   Database notes
  infra/      Deployment notes
  docs/       Project documentation
```

## Setup

### Backend (requires MySQL)

```powershell
cd backend
npm ci
Copy-Item .env.example .env
# edit DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET
npm run init-db
npm run seed
npm start
```

Expected backend environment:

```dotenv
PORT=4000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=supreme
DB_PASSWORD=your-password
DB_NAME=supreme_himalayas
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES=7d
```

### Frontend

```powershell
cd frontend
npm ci
npm run build
npm start
```

The frontend runs on port 3000 by default.

## Verified status (2026-11-09)

- [x] Frontend `npm ci` and `npm run build` passed
- [x] `next start` on port 3008 served `/`, `/about`, `/book`, `/blog`, `/contact`, and `/admin/login` with HTTP 200
- [x] Backend `npm ci` passed
- [x] All backend JavaScript files passed syntax checks
- [ ] Backend runtime not started because no local MySQL server is available
- [ ] Full booking/admin workflow not exercised against a live database

## Notes and limitations

- The backend is service-dependent: it requires a MySQL server and a seeded `supreme_himalayas` database.
- Docker is not available in this environment, so the MySQL dependency was not containerized.
- The frontend build is verified; API calls will fail until the backend and database are running.
- Do not commit `.env`, uploads, or database dumps.

## Troubleshooting

- **`ECONNREFUSED 3306`**: start MySQL and confirm `DB_HOST`/`DB_PORT`.
- **Access denied**: verify `DB_USER` and `DB_PASSWORD`, and that the user can access `DB_NAME`.
- **Tables missing**: run `npm run init-db` and `npm run seed` in `backend/`.
- **Frontend API errors**: confirm the backend is running on port 4000 and the frontend API base URL matches.
