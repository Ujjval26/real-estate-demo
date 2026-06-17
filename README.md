# Estateably — UK Property Portal

A clean, modern UK property portal inspired by Rightmove & Zoopla. Buy, rent,
or list property across the UK. All prices in GBP. Built for buyers, renters,
sellers, landlords and estate agents.

> Built with Next.js 16 (App Router) + Turso (libSQL) + Prisma + Tailwind v4 +
> shadcn/ui + JWT (jose) auth + bcrypt + Leaflet maps.

---

## Tech stack

| Layer        | Choice                                                            |
| ------------ | ---------------------------------------------------------------- |
| Framework    | Next.js 16 (App Router, API routes) + TypeScript 5               |
| Database     | Turso (libSQL / SQLite-compatible)                               |
| ORM          | Prisma 6 via `@prisma/adapter-libsql` driver adapter             |
| Auth         | JWT (`jose`, edge-compatible) in httpOnly cookies + bcrypt       |
| Styling      | Tailwind CSS v4 + shadcn/ui (New York) + lucide-react icons      |
| Maps         | Leaflet + react-leaflet (no API key required)                    |
| Image upload | Cloudinary-ready (falls back to URL storage in Turso)            |
| Email        | nodemailer (any SMTP provider — Resend / SendGrid / Postmark)    |
| Deployment   | Vercel                                                           |

---

## Quick start

```bash
# 1. Install dependencies
bun install

# 2. Configure env
cp .env.example .env.local
#   edit .env.local and fill in TURSO_DATABASE_URL + TURSO_AUTH_TOKEN + JWT_SECRET

# 3. Apply database schema to Turso
bun run scripts/push-schema.ts

# 4. Seed sample data (20+ UK properties, 6 demo users)
bun run scripts/seed.ts

# 5. Start the dev server
bun run dev
```

Open http://localhost:3000 — you should see the home page with featured listings.

---

## Demo accounts

After running the seed script, these accounts are available. The password for
every account is **`password123`**.

| Role  | Email                          | What you can do                       |
| ----- | ------------------------------ | ------------------------------------- |
| Admin | `admin@estateably.example`     | Full admin panel access               |
| Agent | `sarah@estateably.example`     | List, edit, delete own properties     |
| Agent | `james@estateably.example`     | List, edit, delete own properties     |
| Agent | `emma@estateably.example`      | List, edit, delete own properties     |
| Buyer | `olivia@example.com`           | Save properties, message agents, etc. |
| Buyer | `daniel@example.com`           | Save properties, message agents, etc. |

---

## Project structure

```
.
├── prisma/
│   ├── schema.prisma        # Prisma schema (PascalCase models → snake_case tables)
│   └── schema.sql           # Raw libSQL/SQLite CREATE TABLE statements
├── scripts/
│   ├── push-schema.ts       # Apply schema.sql to Turso (idempotent)
│   ├── check-db.ts          # Prisma ↔ Turso connection smoke test
│   └── seed.ts              # Seed 26 sample properties + 6 demo users
├── src/
│   ├── app/
│   │   ├── api/             # auth, properties, favourites, messages, ...
│   │   ├── property/[slug]/ # property details page
│   │   ├── search/          # search results + Leaflet map + filters
│   │   ├── compare/         # side-by-side property comparison
│   │   ├── dashboard/       # user dashboard (overview, searches, viewings, messages, profile)
│   │   ├── agent/           # agent dashboard + add/edit listing forms
│   │   ├── admin/           # admin panel (users, listings, analytics)
│   │   ├── login/ signup/   # auth pages
│   │   └── about, contact, faqs, terms, privacy
│   ├── components/          # Reusable React components
│   ├── lib/                 # db client, auth helpers, format utils
│   ├── types/               # Shared TypeScript types
│   └── middleware.ts        # Route protection (edge runtime, JWT-verified)
├── .env.example             # Environment variable template (no real secrets)
├── .env.local               # Local secrets (gitignored)
└── worklog.md               # Append-only build log
```

---

## Features

### Public
- **Home page** — hero search (Buy/Rent toggle), popular locations, featured listings, how-it-works, testimonials
- **Search** — filters sidebar (listing type, location, property type, price range, bedrooms, garden/parking/new build), list view with pagination, **map view with Leaflet**, sort by price/date
- **Property details** — image gallery with lightbox, price in GBP, description, key features, EPC rating, mortgage calculator, **stamp duty calculator**, agent contact card, **request viewing** form, similar properties, **agent reviews**
- **Compare** — side-by-side table for up to 4 properties (localStorage-backed, floating compare bar)
- **SEO-friendly URLs** — `/property/3-bed-house-in-nottingham-ng2-7js-5nz0cx`
- Static pages: About, Contact, FAQs, Terms, Privacy

### Authenticated (buyer/renter)
- **Signup / login** with role selection (buyer or agent)
- **Save/favourite** properties (heart icon)
- **Save searches** with optional email alerts
- **Messages inbox** — conversation threads with agents, inline reply
- **Viewing requests** — track status (pending/confirmed/declined/completed)
- **Profile settings** — update name, phone, logout

### Agent / landlord
- **Agent dashboard** — stats cards (total listings, active, views, enquiries)
- **Add listing** — 5-step form (type/price → details → location → features → photos)
- **Edit listing** — pre-filled form with image management
- **Soft delete** — sets status to `withdrawn` (preserves audit trail)
- **Listing performance** — view counts, enquiry counts per listing

### Admin
- **Stats dashboard** — 11 site-wide metrics, top 5 most-viewed properties, recent signups
- **Manage users** — search, filter by role, change role, delete (with confirm)
- **Manage listings** — search, filter by status, change status, hard delete (with confirm)

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in real values. **Never commit
`.env.local`.**

| Variable                | Required? | Purpose                                    |
| ----------------------- | --------- | ------------------------------------------ |
| `TURSO_DATABASE_URL`    | ✅        | libSQL database URL                        |
| `TURSO_AUTH_TOKEN`      | ✅        | libSQL access token                        |
| `JWT_SECRET`            | ✅        | Secret for signing JWTs (≥ 32 chars)       |
| `JWT_EXPIRES_IN`        | ⬜        | Token lifetime (default `7d`)              |
| `CLOUDINARY_CLOUD_NAME` | ⬜        | Image uploads (omit to use URL storage)    |
| `CLOUDINARY_API_KEY`    | ⬜        | Image uploads                              |
| `CLOUDINARY_API_SECRET` | ⬜        | Image uploads                              |
| `SMTP_HOST`             | ⬜        | Transactional email                        |
| `SMTP_PORT`             | ⬜        | Transactional email                        |
| `SMTP_USER`             | ⬜        | Transactional email                        |
| `SMTP_PASSWORD`         | ⬜        | Transactional email                        |
| `EMAIL_FROM`            | ⬜        | Transactional email                        |
| `NEXT_PUBLIC_APP_URL`   | ⬜        | Public URL (for email links, OG tags)      |
| `NEXT_PUBLIC_APP_NAME`  | ⬜        | Brand name shown in UI                     |

---

## Database

The Turso database is the source of truth. Two schema representations are kept
in sync:

1. **`prisma/schema.prisma`** — used by Prisma Client for type-safe queries.
2. **`prisma/schema.sql`** — the raw libSQL DDL, applied to Turso by
   `scripts/push-schema.ts` (since `prisma db push` does not yet speak the
   libSQL adapter protocol directly).

Run `bun run scripts/push-schema.ts` after any schema change. The script is
idempotent (`IF NOT EXISTS` everywhere) so re-running is safe.

### Tables
- `users` — name, email, password_hash, role (buyer/agent/admin), phone, email_verified
- `properties` — title, slug, description, price (GBP), listing_type, property_type, beds, baths, address, postcode, city, lat/lng, epc_rating, features (JSON), status, view_count, enquiry_count
- `property_images` — property_id, image_url, sort_order
- `favourites` — user_id, property_id (unique per pair)
- `saved_searches` — user_id, search_criteria (JSON), email_alerts_enabled
- `messages` — sender_id, receiver_id, property_id, subject, message_text, read_status
- `viewing_requests` — user_id, property_id, requested_date, status, notes
- `reviews` — agent_id, user_id, rating (1-5), comment (unique per agent-user pair)

---

## Deployment (Vercel)

1. Push the repo to GitHub.
2. Import the repo in Vercel.
3. Add all env vars from `.env.example` in the Vercel project settings.
4. Run `bun run scripts/push-schema.ts` and `bun run scripts/seed.ts` once
   against your production Turso database (from your local machine, with the
   production env vars loaded).
5. Deploy. Vercel auto-detects Next.js.

---

## Roadmap

All 8 steps of the original build plan are complete:

- [x] **Step 1** — Project structure + Turso schema + connection setup
- [x] **Step 2** — Auth (signup/login/roles/middleware)
- [x] **Step 3** — Property CRUD + image upload
- [x] **Step 4** — Search/filter/map functionality
- [x] **Step 5** — User & agent dashboards
- [x] **Step 6** — Extra features (calculators, messaging, alerts, reviews, compare)
- [x] **Step 7** — Admin panel
- [x] **Step 8** — Final polish, seed data, static pages

See `worklog.md` for a detailed build log.

---

## Notes & caveats

- **Email alerts / verification**: The schema and API are wired up but the
  actual SMTP delivery is not enabled (no SMTP env vars configured). Wire up
  any SMTP provider in `.env.local` to enable email.
- **Cloudinary uploads**: The image upload API accepts URLs and stores them
  in Turso. To enable real Cloudinary uploads, fill in `CLOUDINARY_*` env
  vars and update `/api/properties/[idOrSlug]/images` to use signed uploads.
- **Geocoding**: Property lat/lng are seeded manually. In production, you'd
  integrate a UK postcode lookup API (e.g. postcodes.io) to auto-geocode.
- **This is a demo**: All listings, agents, and reviews are sample data. No
  real transactions take place. Don't enter real financial information.
