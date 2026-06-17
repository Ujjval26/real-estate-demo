# Estateably — Work Log

Shared, append-only work log for the real-estate platform build.

---
Task ID: 1
Agent: main
Task: Step 1 — Project structure + Turso schema + connection setup

Work Log:
- Loaded the `fullstack-dev` skill and initialised the dev environment.
- Installed runtime deps: `@prisma/adapter-libsql`, `@libsql/client`,
  `bcryptjs`, `jsonwebtoken`, `cloudinary`, `nodemailer`, `leaflet`,
  `react-leaflet`, plus their `@types/*`.
- Wrote `prisma/schema.prisma` with all 8 models (User, Property,
  PropertyImage, Favourite, SavedSearch, Message, ViewingRequest, Review).
  Used `@@map` / `@map` so Prisma's PascalCase models map onto the
  snake_case SQL tables.
- Wrote `prisma/schema.sql` — libSQL/SQLite-compatible CREATE TABLE
  statements with indexes, CHECK constraints, and FK relationships.
- Updated `src/lib/db.ts` to use `PrismaLibSql` driver adapter against
  the Turso URL/auth token.
- Wrote `.env.example` (placeholders only — no real secrets) and
  `.env.local` (with the user-provided Turso credentials, gitignored).
- Wrote `scripts/push-schema.ts` — applies schema.sql to Turso via the
  libSQL client (works around `prisma db push` not speaking libSQL).
- Wrote `scripts/check-db.ts` — Prisma smoke test that counts rows in
  every table.
- Pushed the schema to Turso: 27 statements applied, 8 tables created.
  Verified Prisma can query them — all row counts come back as 0.
- Created `src/types/index.ts` (shared TypeScript types) and
  `src/lib/format.ts` (GBP formatting, slugify, postcode validation,
  haversine distance).
- Created the folder skeleton for upcoming routes (search, property,
  dashboard, agent, admin, api/*, static pages).
- Updated `src/app/globals.css` to use the requested deep-teal accent.
- Replaced the default Z.ai scaffold home page with a minimal
  "Step 1 complete" placeholder so the dev server renders something
  meaningful while we wait for user confirmation before Step 2.

Stage Summary:
- Tech stack confirmed: Next.js 16 + TypeScript + Tailwind v4 +
  shadcn/ui + Prisma (libSQL adapter) + Turso.
- DB is live at `libsql://demo-ujjval.aws-eu-west-1.turso.io` with all
  8 tables.
- Ready to proceed to Step 2 (auth: signup / login / roles / middleware)
  pending user confirmation.
