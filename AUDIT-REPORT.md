# RealEstate (Estateably) — Full Site Audit Report

**Site:** https://real-estate-demo-three-omega.vercel.app
**Date:** 30 June 2026

---

## 🚨 CRITICAL / HIGH SEVERITY

| # | Issue | Location | Details |
|---|-------|----------|---------|
| 1 | **Negative bedrooms/bathrooms accepted** | `src/app/api/properties/route.ts:166-178` | POST `/api/properties` validates only `price < 0` — `bedrooms: -1`, `bathrooms: -3` accepted. Live site has a property with these values (Vintage cottage 2-rooms). |
| 2 | **PATCH properties has zero validation** | `src/app/api/properties/[idOrSlug]/route.ts:85-98` | Any field can be set to negative/invalid values. No validation at all beyond basic type check. |
| 3 | **No DB constraints on numeric fields** | `prisma/schema.prisma:58-99` | Bedrooms, bathrooms, price, viewCount, enquiryCount have no minimum/positive constraints in schema or SQLite. |
| 4 | **Zod v4 may silently break** | `package.json:91` | `"zod": "^4.0.2"` — Zod v4 has breaking changes from v3. Login, signup, profile APIs all use Zod schemas that may behave differently. |
| 5 | **Missing required env vars** | `.env` | Only `DATABASE_URL=file:/home/z/...` (nonexistent path). Missing `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `JWT_SECRET` — app would crash on local startup. |

---

## ⚠️ MEDIUM SEVERITY

| # | Issue | Location | Details |
|---|-------|----------|---------|
| 6 | **`/api/health` returns 401** | `middleware.ts:33-37` | Root `/api/` route is protected by auth middleware. Basic health check is unusable without authentication. |
| 7 | **`/forgot-password` listed as public but 404s** | `middleware.ts:30` | Route is let through middleware but no page exists — users get a 404. |
| 8 | **Search is client-side only (no SSR)** | `search/page.tsx:13`, `search-client.tsx:112-131` | Always shows "Loading search..." on initial render. Poor SEO. Results fetched client-side after hydration. |
| 9 | **Search has 250ms debounce flash** | `search-client.tsx:112-131` | Every filter change clears results and shows "Searching..." for 250ms before fetching. Causes flickering UX. |
| 10 | **`/api/favourites` silently swallows ALL errors** | `api/favourites/route.ts:30-36` | Returns `{ok:true}` even if DB is down or other errors occur. |
| 11 | **Contact form does nothing** | `contact/contact-form.tsx:18-27` | Form simulates submission with a fake timeout. No data is sent anywhere. Misleading UX. |
| 12 | **`next.config.ts` `ignoreBuildErrors: true`** | `next.config.ts:7` | TypeScript errors pass silently during builds — unknown type bugs may exist in production. |
| 13 | **`next.config.ts` `reactStrictMode: false`** | `next.config.ts:9` | Hides React side-effect bugs that double-invocation would catch. |
| 14 | **Signup phone field has no validation** | `api/auth/signup/route.ts:15`, `signup-form.tsx:112-120` | Any string accepted as phone — no UK format check. |
| 15 | **Profile API phone not validated** | `api/auth/profile/route.ts:8` | `z.string().optional().nullable()` — no phone format validation. |
| 16 | **No email verification flow** | `api/auth/signup/route.ts:46` | Accounts created with `emailVerified: false` but never verified. No verification email sent. Flag never used to gate anything. |

---

## 🔧 LOW SEVERITY

| # | Issue | Location | Details |
|---|-------|----------|---------|
| 17 | **Fragile `msg.includes("Unique")` error check** | `api/reviews/route.ts:70-76` | Error message parsing is fragile across DB/Prisma versions. |
| 18 | **View count error silently swallowed** | `api/properties/[idOrSlug]/route.ts:57-59` | `.catch(() => {})` — any error in view count increment is silently ignored. |
| 19 | **Leaflet re-imported on every property change** | `property-map.tsx:81-82` | `await import("leaflet")` called every time properties change — inefficient. |
| 20 | **Gallery thumbnails missing `loading="lazy"`** | `property-gallery.tsx:85` | Thumbnail images load eagerly, slowing initial page load. |
| 21 | **PropertyCard uses `<img>` not Next `<Image>`** | `property-card.tsx:121-126` | No automatic image optimization, no responsive sizes, risk of layout shift. |
| 22 | **Saved searches lose `sort` parameter** | `save-search-button.tsx:33-36` | Sort order explicitly deleted when saving a search. |
| 23 | **Favourite button has no loading spinner** | `property-card.tsx:53-78` | Button just appears disabled during transition — no visual feedback. |
| 24 | **Agent listings limited to 100, no pagination** | `agent/page.tsx:25` | `take: 100` with no pagination — agents with 100+ listings lose the rest. |
| 25 | **City matching uses `contains` — inexact** | `similar-properties.tsx:22-25` | `city: { contains: property.city }` could match unintended cities. |
| 26 | **No latitude/longitude range validation** | `api/properties/route.ts:205-206` | Latitude -90 to 90, longitude -180 to 180 not enforced. |
| 27 | **No rate limiting on login** | `api/auth/login/route.ts` | Brute-force attacks possible — no rate limiting on any API endpoint. |
| 28 | **No CSRF protection** | All API routes | POST endpoints potentially vulnerable to CSRF (partially mitigated by httpOnly cookies). |
| 29 | **`@hookform/resolvers` installed but unused** | `package.json:21` | Dead dependency, adds to bundle size. |
| 30 | **`jsonwebtoken` installed but unused** | `package.json:66` | Another dead dependency — `jose` is used instead. |
| 31 | **Favourite click on unauthenticated state doesn't redirect** | `property-card.tsx:58-71` | Shows toast "Please log in" but doesn't redirect to `/login` — missed UX opportunity. |

---

## 📋 LIVE SITE VERIFICATION

| Page/Endpoint | Status | Notes |
|---------------|--------|-------|
| Homepage `/` | ✅ | Loads, shows featured properties, popular locations |
| Search `/search` | ✅ | Client-side fetch works (after "Loading..." flash) |
| Property detail `/property/[slug]` | ✅ | Details, mortgage calc, stamp duty calc, similar properties |
| Login `/login` | ✅ | Form renders |
| Signup `/signup` | ✅ | Form renders with role selection |
| About `/about` | ✅ | |
| Contact `/contact` | ✅ | Form does nothing on submit |
| FAQs `/faqs` | ✅ | Accordion interaction works |
| Terms `/terms` | ✅ | |
| Privacy `/privacy` | ✅ | |
| Compare `/compare` | ✅ | Empty state when nothing selected |
| Dashboard `/dashboard` | 🔒 | Redirects to login (requires auth) |
| Agent `/agent` | 🔒 | Redirects to login (requires auth) |
| Agent new `/agent/new` | 🔒 | Redirects to login (requires auth) |
| `/api/properties` | ✅ | Returns 27 properties with pagination |
| `/api/properties?city=London` | ✅ | Filters correctly |
| `/api/health` (root `/api/`) | ❌ | 401 — incorrectly protected by auth |

**Known bad data on live:** Property "Vintage cottage 2-rooms" — `price: £0`, `bedrooms: -1`, `bathrooms: -3`, `postcode: "-1"`, description "TESTING VALIDATIONS".
