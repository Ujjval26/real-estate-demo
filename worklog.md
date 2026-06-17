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
- Wrote `prisma/schema.prisma` with all 8 models and `@@map` / `@map`
  annotations aligning PascalCase models to snake_case SQL tables.
- Wrote `prisma/schema.sql` — libSQL/SQLite-compatible CREATE TABLE
  statements with indexes, CHECK constraints, and FK relationships.
- Updated `src/lib/db.ts` to use `PrismaLibSql` driver adapter.
- Pushed schema to Turso: 27 statements applied, 8 tables created.
- Verified Prisma ↔ Turso connection (all row counts return 0).
- Created `src/types/index.ts` and `src/lib/format.ts` helpers.
- Created folder skeleton for upcoming routes.
- Applied deep-teal accent color theme.

Stage Summary:
- DB live at `libsql://demo-ujjval.aws-eu-west-1.turso.io` with all 8 tables.
- Ready for Step 2.

---
Task ID: 2-8
Agent: main
Task: Steps 2 through 8 — auth, CRUD, search, dashboards, features, admin, polish

Work Log (consolidated):

Step 2 (auth):
- JWT helpers (sign/verify with `jose`, edge-compatible), bcrypt hashing,
  httpOnly cookies, getSession(), getCurrentUser(), requireUser()
- /api/auth/{signup,login,logout,me,profile} routes
- middleware.ts: route protection (public pages, gated API, role redirects)
- Login + signup pages with role selector (buyer/agent)

Step 3 (property CRUD):
- /api/properties GET (filter/sort/paginate) + POST (create)
- /api/properties/[idOrSlug] unified route (resolves by cuid OR slug):
  GET, PATCH, DELETE (soft delete)
- /api/properties/[idOrSlug]/images POST/PATCH/DELETE
- /api/favourites, /api/messages, /api/viewing-requests
- Multi-step ListingForm (5 steps: type/price, details, location, features, photos)
- Agent dashboard + /agent/new + /agent/[id] edit page
- /property/[slug] public details page with gallery, agent contact,
  mortgage & stamp duty calculators, request viewing, similar properties

Step 4 (search):
- Full home page with hero search, popular locations, featured listings,
  how-it-works, testimonials, CTA
- /search with filters sidebar, list view + pagination, map view (Leaflet),
  sort, URL-synced filter state, mobile Sheet, skeletons, empty state
- PropertyMap component (dynamic leaflet import to avoid SSR window issue)
- HomeHeroSearch component

Step 5 (dashboards):
- /dashboard overview with saved properties, recent viewings, saved searches,
  recent messages, sidebar nav
- /dashboard/searches (toggle alerts + delete)
- /dashboard/viewings (status badges)
- /dashboard/messages (collapsible conversation threads + inline reply)
- /dashboard/profile (name/phone editing + logout)
- /api/saved-searches + /api/auth/profile
- SaveSearchButton in search toolbar

Step 6 (extra features):
- /api/reviews GET (public) + POST (auth, unique per agent-user pair)
- AgentReviews component with star rating, average rating, submit form
- /compare page with side-by-side table for up to 4 properties
- CompareBar (floating bottom bar)
- Compare toggle button (GitCompareArrows icon) on PropertyCard
- Compare list in localStorage, syncs across components via custom event
- SonnerToaster for global toast notifications
- Mortgage + stamp duty calculators on property page
- Messaging + saved searches + alerts already wired

Step 7 (admin):
- /admin dashboard with 11 stat cards + top 5 most-viewed + recent signups
- /admin/users with search, role filter, role-change dropdown, delete dialog
- /admin/listings with search, status filter, status-change, hard delete
- /api/admin/users, /api/admin/listings, /api/admin/stats

Step 8 (polish + seed):
- Static pages: About, Contact (with form), FAQs (accordion), Terms, Privacy
- scripts/seed.ts: 26 sample properties across 14 UK cities, 6 demo users
  (1 admin, 3 agents, 2 buyers), sample favourites/messages/reviews
- Switched JWT from `jsonwebtoken` to `jose` (edge-compatible, fixes
  middleware 401 bug)
- Fixed Leaflet SSR issue by dynamically importing in useEffect
- Fixed `Compare` icon import (use `GitCompare` from lucide-react)
- Added `/compare` to middleware PUBLIC_PATHS
- Comprehensive README with setup, demo accounts, features, env vars
- Browser-verified all major routes (/, /search, /property/[slug], /login,
  /dashboard, /admin) and the auth flow (login → cookie → protected API)

Stage Summary:
- All 8 steps complete. Full real-estate platform live on Turso.
- 26 sample properties, 6 demo accounts (password: password123).
- Routes verified returning 200: /, /about, /contact, /faqs, /terms, /privacy,
  /search, /property/[slug], /compare, /login, /signup
- Auth flow verified: login → /api/auth/me → /api/messages all return correct
  data with the session cookie.
- 13 commits pushed to GitHub (one per step + chore commits for gitignore fixes).
