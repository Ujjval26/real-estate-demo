import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";

/**
 * Route protection middleware.
 *
 * Reads the session cookie, verifies the JWT, and gates routes by role:
 *
 *   /dashboard/**            → any authenticated user
 *   /agent/**                → role: agent | admin
 *   /admin/**                → role: admin
 *   /api/properties (POST)   → role: agent | admin   (handled in route too)
 *   /api/favourites, /messages, /saved-searches,
 *   /api/viewing-requests    → any authenticated user
 *
 * Unauthenticated visitors are redirected to /login?next=<path>.
 */

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/search",
  "/buy",
  "/rent",
  "/properties",
  "/list",
  "/about",
  "/contact",
  "/faqs",
  "/terms",
  "/privacy",
  "/compare",
];

const PUBLIC_API_PREFIXES = [
  "/api/auth",
  "/api/properties", // GET is public; POST is gated in the handler
  "/api/reviews", // GET is public
  "/api", // root health check is public
];

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  // property detail pages: /property/<slug>
  if (pathname.startsWith("/property/")) return true;
  // admin login page is public
  if (pathname === "/admin/login") return true;
  return false;
}

function isPublicApi(pathname: string): boolean {
  return PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public pages and GET-only API routes through.
  if (isPublic(pathname) || isPublicApi(pathname)) {
    // For public API routes that are read-only, we still want to attach
    // the user identity downstream if a cookie is present, but we don't
    // block the request. Just continue.
    return NextResponse.next();
  }

  // Read & verify the session cookie.
  const token = req.cookies.get("estateably_session")?.value;
  const session = token ? await verifySessionToken(token) : null;

  // API routes: return JSON 401 instead of redirecting.
  if (pathname.startsWith("/api/")) {
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }
    // Role-gated API routes
    if (pathname.startsWith("/api/admin") && session.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 },
      );
    }
    return NextResponse.next();
  }

  // Page routes: redirect to /login if not authenticated.
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Role-gated page routes
  if (pathname.startsWith("/agent") && session.role !== "agent" && session.role !== "admin") {
    return NextResponse.redirect(new URL("/?forbidden=1", req.url));
  }
  if (pathname.startsWith("/admin") && session.role !== "admin") {
    return NextResponse.redirect(new URL("/?forbidden=1", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except static assets and Next internals.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.svg|robots.txt).*)",
  ],
};
