import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql/web";

/**
 * Turso (libSQL) backed Prisma client.
 *
 * Uses the WASM variant (@prisma/adapter-libsql/web) so native binaries
 * are not required — works on any platform (local dev, Vercel serverless).
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

  const adapter = new PrismaLibSql({ url, authToken });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
