# IMPORTANT — Trekking with Rabin Project Notes

> Everything important about running, credentialing, and maintaining this project.
> Do **not** deploy, push to git, or commit anything unless explicitly asked.

---

## 1. How to Run (Docker — the only supported way)

**Two compose projects** (user's setup): `rabin-db` (MySQL) + `rabin` (api + web).
They share the external `rabin-net` network; the api reaches MySQL as host `rabin-mysql`.

From the project root (`D:\projects\Travels`):

```powershell
docker compose -f infra/docker-compose.yml up -d   # start MySQL project (rabin-db)
docker compose -f app/docker-compose.yml up -d --build   # build+start api+web project (rabin)
```

Open:
- **Website:** http://localhost:3000
- **Admin panel:** http://localhost:3000/admin/login
- **API:** http://localhost:4000  (health check: `GET /api/health`)
- **Images:** http://localhost:4000/uploads/media/*.svg

Useful commands:

```powershell
docker compose -f infra/docker-compose.yml up -d          # DB only
docker compose -f app/docker-compose.yml up -d --build web   # rebuild web only
docker compose -f app/docker-compose.yml up -d --build api   # rebuild api only
docker compose -f app/docker-compose.yml logs -f web      # live logs
docker compose -f app/docker-compose.yml ps               # app containers (all "healthy")
docker exec -it rabin-mysql mysql -uroot -proot_password supreme_himalayas   # SQL shell
```

Requirements: **Docker Desktop running**, ports **3000 / 4000 / 3306** free.

---

## 2. Accounts & Credentials (demo / dev only)

| What           | Value                                    |
| -------------- | ---------------------------------------- |
| Admin login    | `admin` / `admin123`                      |
| Editor login   | `editor` / `admin123`                     |
| MySQL root     | `root` / `root_password`                  |
| MySQL app user | `supreme` / `supreme_pass` (db `supreme_himalayas`)   |
| JWT secret     | `change-me-in-production` (compose env)   |
| MySQL port     | `3306` (published)                        |

---

## 3. Architecture in short

```
Travels/
├── infra/docker-compose.yml  # project "rabin-db": MySQL (container rabin-mysql), volume rabin_mysql_data
├── app/docker-compose.yml    # project "rabin": api (rabin-api) + web (rabin-web)
├── api/                      # Express REST API, port 4000
│   └── src/                  # routes, middleware (JWT), db (init/seed/generate-images)
└── web/                      # Next.js 15 App Router, port 3000
    └── src/                  # app/ (public + admin), components/, lib/
```

- Public data flows: **server components** fetch the API, client components (browsers) fetch the API.
- Brand: **Trekking with Rabin** — "Himalayan Dawn" palette (deep navy `--alpine` #1E3A5F + night navy `--alpine-deep` #0F1A33,
  primary blue `--glacier` #3A5A8C, amber accent `--flag-red` #E8913A, snow/glacial-cream surfaces);
  Oswald/Karla type; faceted mountain dividers.
- **Light/dark mode**: `globals.css` defines `:root` (light) + `:root[data-theme='dark']`. A no-flash inline
  script in `layout.jsx` reads `localStorage 'twr-theme'` (fallback: `prefers-color-scheme`); the sun/moon toggle
  lives in the header (`web/src/components/ThemeToggle.jsx`). Brand navy/blue/amber stay constant; surfaces,
  text and lines flip. When adding colors: use the tokens (`--surface`, `--heading`, `--charcoal-soft`,
  `--on-dark-soft`, `--text-mute`, ...) — never hardcode a hex, or it breaks in one of the themes.

### Networking (important — don't break)

- `NEXT_PUBLIC_API_URL` → **browser** URL (`http://localhost:4000`), baked in at build time (Docker ARG).
- `API_INTERNAL_URL` → **server-side** URL inside Docker (`http://rabin-api:4000`), runtime env on the web container.
- DB host from the api container is **`rabin-mysql`** (container name on shared `rabin-net`), not `mysql`.
- Server code that fetches data must use `API_URL_SERVER` (from `web/src/lib/api.js`); image `src`s must always use the public `API_URL` (browsers can't resolve `rabin-api:4000`).

---

## 4. Known gotchas (learned the hard way)

1. **`uploadsDir` bug (fixed)** — was one directory too shallow (`src/uploads`), so all images 404'd.
   Now correctly `path.join(__dirname, '..', '..', 'uploads')` in `api/src/config/db.js`.
   Do not "refactor" it back.
2. **Media bind mount**: `./api/uploads:/app/uploads` (API container). Uploaded images live on the host;
   the media dir is gitignored except `.gitkeep`.
3. **Seed runs once**: `api/scripts/start.sh` seeds only when `admin_users` is empty (idempotent).
   Data lives in the named volume **`rabin_mysql_data`** (project rabin-db).
   The old volume `travels_mysql_data` (from the pre-rename setup) was copied into it and kept as a backup.
4. **Regenerate placeholder artwork** (19 SVG scenes): `docker exec rabin-api node src/db/generate-images.js`
   (needed after editing `generate-images.js`, and AFTER rebuilding the api image).
5. **PowerShell + curl**: passing JSON `-d` strings to curl from PowerShell 5.1 mangles quotes —
   use `Invoke-RestMethod -Body (... | ConvertTo-Json)` for API tests instead.
6. **Rebuild matters**: the API container runs the code baked into the image — `docker compose -f app/docker-compose.yml up -d --build api`
   after any `api/` change; same for `web/`.
7. `.env` files and API secrets are gitignored — never commit `.env` or `web/.env.local`.
8. **Admin auth gate (fixed)**: `web/src/app/admin/layout.jsx` must NEVER early-`return` before
   rendering `{children}` — that stripped the login form from the RSC payload and the page showed
   a fomeless "Checking session..." forever. Current version hides the shell with `display:none`
   until the token check passes, so children stay in the payload. Keep it that way.
9. After any `web` rebuild, do a hard refresh (`Ctrl+Shift+R`) — stale cached JS shows old/blank pages.
10. **MySQL here has no `ADD COLUMN IF NOT EXISTS` (that's MariaDB)** — schema upgrades in
    `api/src/db/init.js` must check `information_schema.columns` first (see the reviews migration).
11. **Blog editor is plain-text, not raw HTML** (`web/src/lib/blogText.js`): the admin textarea shows
    readable text (`## heading`, `**bold**`, `[text](url)`, `- bullets`, blank line = paragraph) and
    converts to HTML on save; old HTML posts are converted back to text when opened for editing.
    A toolbar + "Formatting guide" panel sits on the right of the editor; the **heading color**
    (color picker or typed hex) is stored in `blog_posts.heading_color` and applied ONLY to
    `<h2>/<h3>` on the public article page (`--heading-color` CSS var) — links and body text keep
    the site colors.
12. **Trip route map**: packages store `route_points` (JSON `[{name,lat,lng}]`, entered in
    Admin → Edit package → Map card as `Name, lat, lng` lines). The package **Map tab** then shows an
    interactive Leaflet map that auto-draws the route via the free OSRM public server
    (`router.project-osrm.org`, driving profile), with a straight-line fallback if routing fails.
    `map_embed_url` (Google embed) is only used when no waypoints exist. Needs internet in the browser.
13. **Dual-currency prices**: packages return `price_npr` alongside `price` (USD), computed from the
    admin-editable `exchange_rate` setting (Admin → Settings, default 134). Every public price — cards,
    detail widget, departure dates, booking summary — shows USD + NPR (`रू`). BookingForm/detail derive
    per-date NPR from the package rate ratio, so date-level prices convert consistently.
    Admin → Settings also has **"Use live: रू …"** — it calls `GET /api/settings/live-rate`
    (server-side fetch to open.er-api.com, no API key) and fills the field with the real-time USD→NPR
    rate; hit Save to apply it to the whole site.
14. **Leaflet must NOT be imported statically** in any SSR'd component — `import L from 'leaflet'`
    crashes the server bundle with `window is not defined` (a 500 on the package detail page).
    `RouteMap.jsx` must keep loading leaflet via `import('leaflet')` inside `useEffect`
    (the `leaflet/dist/leaflet.css` top-level import is fine).
15. **Rebrand (Trekking with Rabin)** — brand strings live in THREE places, all must stay in sync:    (a) web code (Header/Footer/Logo/about/contact/admin — grep "Supreme"), (b) `api/src/db/seed.js`
    (fresh installs), (c) the **live DB** (settings table + blog/testimonial content — changing code
    alone never touches an existing DB). Nepal-only: categories are Nepal Trekking / Nepal Tours /
    Peak Climbing; Bhutan/Tibet/India were deleted. Client: email `rubhum2058@gmail.com`, phones
    `+977 9762342058` / `+977 9808047141` (both WhatsApp, first on the float), Instagram `@__ra_bin__`,
    Facebook group `615513139185784`. Exchange rate is ~152.4 (update via Admin → Settings → live rate).
16. **Admin sessions are "logout on exit"**: the JWT now lives in a **session cookie** (`sh_admin_token`,
    no `Expires` — set via `document.cookie` in `web/src/lib/admin.js`), so closing the browser fully logs
    the admin out; open tabs keep the session while the browser is running. JWT lifetime is `JWT_EXPIRES=12h`
    (compose env, was 7d). Don't move the token back to `localStorage` — that's what made sessions persist
    across restarts. Note: cookie is not `Secure` (localhost); add `; Secure` before production HTTPS.

---

## 5. What's implemented

- Public site: home (hero slider, trip search, destination tiles, modes, CSR, testimonials, WhatsApp float),
  destinations, package listing with filter drawer + pagination, package detail (gallery lightbox, itinerary tabs,
  departure dates), booking flow (inquiry → confirmation with `booking_ref`), blog, about, contact.
- **Guest reviews (moderated)**: visitors review either a specific trip (Reviews tab on the package page)
  or the company in general (public **/testimonials** page, linked in nav + footer). Submissions are saved
  to the `testimonials` table with `status='pending'` and are hidden from the site.
  Admin → Testimonials has a per-row **"Show on website" checkbox** — tick it to publish only the good
  reviews (sets `approved`; untick hides = `rejected`). Public `GET /api/testimonials` returns only
  `approved` (optionally `?package_id=` for one trip); `GET /api/testimonials/admin` (auth) shows all.
  Admin-added testimonials go live immediately; existing rows were auto-approved once via the
  `_reviews_migrated` settings flag. Approved reviews appear on /testimonials, the homepage carousel,
  and — if tied to a package — on that trip's Reviews tab.
- Admin: dashboard, packages (CRUD), categories, bookings (status + `payment_status` workflow),
  inquiries, blog, testimonials (moderation), media library, settings.
- Mobile-ready: admin off-canvas nav, tables → labeled cards, filter drawer on listing pages.
- DB tables: `categories`, `packages`, `inquiries`, `bookings`, `blog_posts`, `testimonials`
  (has `status`, `package_id`), `admin_users`, `settings`.

---

## 6. Next steps (roadmap from the brief)

- Phase 4: payment gateway (Stripe for intl, eSewa/Khalti for Nepal) → checkout writes `bookings.payment_status`;
  `fixed_departure_dates` already carry `{date, price, available}` for inventory.
- Wire a mail provider (Resend / Nodemailer) into booking + inquiry routes.
- Replace placeholder SVG scenes with real photography via the admin Media Library.
- **Before any production deployment**: change `JWT_SECRET`, DB passwords, add HTTPS, use real production envs.

---

*Last updated: 2026-08-09 — rebranded to **Trekking with Rabin** (white/black/green, Nepal-only), containers renamed
into two compose projects (`rabin-db` infra + `rabin` app; volumes migrated to `rabin_mysql_data`), all routes 200,
all containers healthy.*