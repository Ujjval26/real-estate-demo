import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "./db";
import type { UserRole } from "@/types";

/**
 * JWT-based authentication helpers.
 *
 * Uses the `jose` library (edge-compatible) so the same verify function
 * works in both middleware (edge runtime) and route handlers (node).
 *
 * Tokens are stored in an httpOnly cookie (`estateably_session`) so they
 * cannot be read by client-side JavaScript (XSS-resistant). The cookie is
 * signed with `JWT_SECRET` and contains the user id, email, and role.
 */

const COOKIE_NAME = "estateably_session";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET must be set and at least 32 characters long. See .env.example.",
    );
  }
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
  name: string;
}

/** Hash a plaintext password using bcrypt (10 rounds). */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

/** Verify a plaintext password against a bcrypt hash. */
export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** Sign a JWT containing the user's session payload. */
export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN ?? "7d")
    .sign(getJwtSecret());
}

/** Verify a JWT and return its payload (or null if invalid/expired). */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      role: payload.role as UserRole,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

/** Set the session cookie (call from a Server Action or Route Handler). */
export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

/** Clear the session cookie (logout). */
export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Read the current session from the cookie. Returns null if logged out. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Return the current user's database record (or null if logged out).
 * Useful in Server Components / Route Handlers to access the full user.
 */
export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;
  const user = await db.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      emailVerified: true,
      createdAt: true,
    },
  });
  return user;
});

/**
 * Require that a user is logged in. Throws an Error with a clear code if not.
 *
 * Usage:
 *   const user = await requireUser();
 *   const agent = await requireUser("agent");
 */
export async function requireUser(role?: UserRole) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }
  if (role && user.role !== role && user.role !== "admin") {
    throw new Error("FORBIDDEN");
  }
  return user;
}
