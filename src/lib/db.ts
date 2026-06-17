import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

/**
 * Turso (libSQL) backed Prisma client.
 *
 * We instantiate a single shared client on the server and cache it on
 * `globalThis` so that Next.js's hot-reload in development does not
 * exhaust database connections.
 *
 * Required env vars:
 *   - TURSO_DATABASE_URL   e.g. libsql://my-db.turso.io
 *   - TURSO_AUTH_TOKEN     the database access token
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error(
      "Missing TURSO_DATABASE_URL. Please set it in your environment variables.",
    );
  }

  // The PrismaLibSql adapter accepts a config object that mirrors the
  // @libsql/client `createClient` options.
  const adapter = new PrismaLibSql({ url, authToken });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
