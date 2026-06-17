# Estateably — UK Property Portal

A clean, modern UK property portal inspired by Rightmove & Zoopla. Buy, rent,
or list property across the UK. All prices in GBP. Built for buyers, renters,
sellers, landlords and estate agents.

> Built with Next.js 16 (App Router) + Turso (libSQL) + Prisma + Tailwind v4 +
> shadcn/ui + JWT auth + bcrypt + Leaflet maps.

---

## Tech stack

| Layer        | Choice                                                            |
| ------------ | ---------------------------------------------------------------- |
| Framework    | Next.js 16 (App Router, API routes) + TypeScript 5               |
| Database     | Turso (libSQL / SQLite-compatible)                               |
| ORM          | Prisma 6 via `@prisma/adapter-libsql` driver adapter             |
| Auth         | JWT in httpOnly cookies + bcrypt password hashing                |
| Styling      | Tailwind CSS v4 + shadcn/ui (New York) + lucide-react icons      |
| Maps         | Leaflet + react-leaflet (no API key required)                    |
| Image upload | Cloudinary (optional — can fall back to URL storage in Turso)    |
| Email        | nodemailer (any SMTP provider — Resend / SendGrid / Postmark)    |
| Deployment   | Vercel                                                           |

---

## Project structure

```
.
├── prisma/
│   ├── schema.prisma        # Prisma schema (PascalCase models)
│   └── schema.sql           # Raw libSQL/SQLite CREATE TABLE statements
├── scripts/
│   ├── push-schema.ts       # Apply schema.sql to Turso
│   ├── check-db.ts          # Prisma ↔ Turso smoke test
│   └── seed.ts              # (added in Step 8) sample data
├── src/
│   ├── app/                 # App Router pages & API routes
│   │   ├── api/             # auth, properties, favourites, messages, ...
│   │   ├── property/[slug]/ # property details
│   │   ├── search/          # search results + map
│   │   ├── dashboard/       # user dashboard
│   │   ├── agent/           # agent/landlord dashboard & listing form
│   │   ├── admin/           # admin panel
│   │   ├── login/ signup/   # auth pages
│   │   └── (about, contact, faqs, terms, privacy)
│   ├── components/          # Reusable React components
│   ├── lib/                 # db client, auth helpers, format utils
│   ├── types/               # Shared TypeScript types
│   └── middleware.ts        # Route protection based on role
├── .env.example             # Environment variable template (no real secrets)
├── .env.local               # Local secrets (gitignored)
└── worklog.md               # Append-only build log
```

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

## Local development

```bash
# 1. Install dependencies
bun install

# 2. Configure env
cp .env.example .env.local
#   edit .env.local and fill in Turso + JWT_SECRET

# 3. Apply database schema to Turso
bun run scripts/push-schema.ts

# 4. (Optional) verify the connection
bun run scripts/check-db.ts

# 5. Start the dev server
bun run dev
```

---

## Database

The Turso database is the source of truth. Two schema representations are kept
in sync:

1. `prisma/schema.prisma` — used by Prisma Client for type-safe queries in the
   application code.
2. `prisma/schema.sql` — the raw libSQL DDL, applied to Turso by
   `scripts/push-schema.ts` (since `prisma db push` does not yet speak the
   libSQL adapter protocol directly).

Run `bun run scripts/push-schema.ts` after any schema change. The script is
idempotent (`IF NOT EXISTS` everywhere) so re-running is safe.

---

## Deployment (Vercel)

1. Push the repo to GitHub.
2. Import the repo in Vercel.
3. Add all env vars from `.env.example` in the Vercel project settings.
4. Deploy. Vercel auto-detects Next.js.

---

## Roadmap (8-step build)

- [x] **Step 1** — Project structure + Turso schema + connection setup
- [ ] **Step 2** — Auth (signup/login/roles/middleware)
- [ ] **Step 3** — Property CRUD + image upload
- [ ] **Step 4** — Search/filter/map functionality
- [ ] **Step 5** — User & agent dashboards
- [ ] **Step 6** — Extra features (calculators, messaging, alerts, reviews, compare)
- [ ] **Step 7** — Admin panel
- [ ] **Step 8** — Final polish, responsiveness check, seed data

See `worklog.md` for a detailed build log.
