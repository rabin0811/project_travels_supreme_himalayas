# Supreme Himalayas — Trekking & Tour Agency Website

Full-stack website for Supreme Himalayas Adventures, built from the project brief:
public marketing/booking site + authenticated admin panel + future-ready booking schema.

## Stack

| Layer     | Choice                          |
| --------- | ------------------------------- |
| Frontend  | Next.js 15 (App Router, React 19) |
| Backend   | Node.js + Express (REST API)    |
| Database  | MySQL 8 (via Docker)            |
| Admin auth| JWT (role: admin / editor)      |
| Images    | Local uploads via API (`/uploads/media`) — swap for Cloudinary/S3 later |

## Architecture

```
Travels/
├── docker-compose.yml      # MySQL + API + web containers
├── api/                    # Express REST API (port 4000)
│   ├── src/
│   │   ├── config/db.js    # mysql2 pool + uploads dir
│   │   ├── db/             # init.js (schema), seed.js, generate-images.js
│   │   ├── middleware/     # JWT auth
│   │   ├── routes/         # auth, packages, categories, bookings,
│   │   │                   # inquiries, blog, testimonials, media, settings, dashboard
│   │   └── index.js
│   └── uploads/media/      # uploaded + seeded images (gitignored)
└── web/                    # Next.js app (port 3000)
    └── src/
        ├── app/            # public pages + /admin/* panel
        ├── components/     # brand components (Hero, TripSearch, PackageCard...)
        └── lib/            # api.js, admin.js, slugify.js
```

## Quick Start

The entire stack (MySQL + API + web) is containerized — the recommended way to run it:

```bash
docker compose up -d --build
```

Open http://localhost:3000 · Admin: http://localhost:3000/admin/login

- API: http://localhost:4000 (images at `/uploads/media/*`)
- `api/scripts/start.sh` creates the schema on first boot and seeds demo content
  (6 categories, 10 packages, blog, testimonials) automatically.
- The API container rebuilds with `docker compose up -d --build api` after code changes;
  the web image rebuilds with `docker compose up -d --build web`.

**Demo admin login:** `admin / admin123` (or `editor / admin123`)

### Local dev (alternative)

```bash
# 1. Start only MySQL
docker compose up -d mysql

# 2. API (port 4000)
cd api
npm install
npm run init-db        # creates schema
npm run seed           # demo content
npm run dev

# 3. Web (port 3000)
cd web
npm install
npm run dev
```

## Networking notes

- `web` fetches the API internally via `API_INTERNAL_URL=http://api:4000` (server components);
  browsers always use `NEXT_PUBLIC_API_URL` (default `http://localhost:4000`) for
  client fetches and `<img>` URLs.
- `web/.env.local` overrides `NEXT_PUBLIC_API_URL` in local dev.

## What's Built

### Public site
- **Home** — hero slider, trip search widget (Destination / Depart / Return / Duration / Submit),
  destination tiles, best-selling packages, 6 trust feature cards, Private/Group/Family/Expert modes,
  special packages, CSR block, testimonials carousel, floating WhatsApp button
- **Destinations** — category listing page + per-category pages with filter sidebar
  (duration, price, grade) and pagination
- **Package detail** — gallery with lightbox, sticky booking widget, tabs
  (Overview, Itinerary, Includes/Excludes, Map, Dates, FAQ), related packages
- **About / Blog / Contact** — team page, travel-guide articles, quick-inquiry form
- **Booking flow** — inquiry-only booking form → confirmation with reference number
  (e.g. `SHB8A5AA9`); no payment collected

### Admin panel (`/admin`)
- Dashboard (package count, new inquiries, bookings this month, recent bookings)
- Package Manager — list + full create/edit form: slug, category, price, duration, grade,
  short/full description, media library gallery, repeatable itinerary day-builder,
  repeatable includes/excludes lists, fixed-departure-date table, map embed URL, draft/publish,
  featured flag
- Category Manager (with nesting support)
- Bookings Manager — status workflow `new → contacted → confirmed → closed`,
  `payment_status` field ready for Phase 4
- Inquiries Manager, Blog Manager, Testimonials Manager
- Media Library (upload / copy URL / delete)
- Settings (contact details, socials, hero copy, trust badges, WhatsApp number)

## Database

Tables: `categories`, `packages`, `inquiries`, `bookings`, `blog_posts`,
`testimonials`, `admin_users`, `settings`.

`bookings.payment_status` (`unpaid | deposit_paid | paid`) exists in the schema but is
unused by the public flow — it's the hook for the future payment gateway phase.
`fixed_departure_dates` stores JSON with `{date, price, available}` (inventory-aware).

## Roadmap (from brief)

- Phase 4: payment gateway — Stripe (international) / eSewa or Khalti (Nepal);
  checkout updates `payment_status`, order summary → deposit/full selection
- Phase 5: deposit reminders, multi-currency, inventory limits per departure,
  role permissions, analytics, multi-language

## Notes

- Placeholder images are generated SVGs in the brand palette (`api/src/db/generate-images.js`).
  Replace with real photography via the admin Media Library.
- The site fetches data with `cache: 'no-store'` so admin edits appear immediately.
- Contact-form emails are recorded in the DB (`inquiries`); wiring a mail provider
  (e.g. Resend/Nodemailer) into the booking/inquiry routes is the natural next step.
