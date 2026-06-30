/**
 * Push the Prisma schema to a Turso (libSQL) database.
 *
 * Prisma CLI's `db push` only supports `file:` URLs, but Turso uses
 * `libsql://`. This script applies the schema via the Prisma client
 * (which connects through the @prisma/adapter-libsql adapter).
 *
 * Usage:
 *   TURSO_DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." npx tsx scripts/push-schema.ts
 */
import { db } from "../src/lib/db";

const SQL = `
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'buyer',
    "phone" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

CREATE TABLE IF NOT EXISTS "properties" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agent_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "listing_type" TEXT NOT NULL DEFAULT 'sale',
    "property_type" TEXT NOT NULL DEFAULT 'house',
    "bedrooms" INTEGER NOT NULL DEFAULT 1,
    "bathrooms" INTEGER NOT NULL DEFAULT 1,
    "reception_rooms" INTEGER NOT NULL DEFAULT 1,
    "address" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "epc_rating" TEXT,
    "features" TEXT NOT NULL DEFAULT '[]',
    "floor_plan_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "is_new_build" BOOLEAN NOT NULL DEFAULT false,
    "has_garden" BOOLEAN NOT NULL DEFAULT false,
    "has_parking" BOOLEAN NOT NULL DEFAULT false,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "enquiry_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "properties_slug_key" ON "properties"("slug");
CREATE INDEX IF NOT EXISTS "properties_city_idx" ON "properties"("city");
CREATE INDEX IF NOT EXISTS "properties_status_idx" ON "properties"("status");
CREATE INDEX IF NOT EXISTS "properties_price_idx" ON "properties"("price");
CREATE INDEX IF NOT EXISTS "properties_agent_id_idx" ON "properties"("agent_id");

CREATE TABLE IF NOT EXISTS "property_images" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "property_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "property_images_property_id_idx" ON "property_images"("property_id");

CREATE TABLE IF NOT EXISTS "favourites" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "favourites_user_id_idx" ON "favourites"("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "favourites_user_id_property_id_key" ON "favourites"("user_id", "property_id");

CREATE TABLE IF NOT EXISTS "saved_searches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "name" TEXT,
    "search_criteria" TEXT NOT NULL DEFAULT '{}',
    "email_alerts_enabled" BOOLEAN NOT NULL DEFAULT false,
    "last_alerted_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "saved_searches_user_id_idx" ON "saved_searches"("user_id");

CREATE TABLE IF NOT EXISTS "messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "property_id" TEXT,
    "subject" TEXT,
    "message_text" TEXT NOT NULL,
    "read_status" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "messages_sender_id_idx" ON "messages"("sender_id");
CREATE INDEX IF NOT EXISTS "messages_receiver_id_idx" ON "messages"("receiver_id");
CREATE INDEX IF NOT EXISTS "messages_property_id_idx" ON "messages"("property_id");

CREATE TABLE IF NOT EXISTS "viewing_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "requested_date" DATETIME NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "viewing_requests_user_id_idx" ON "viewing_requests"("user_id");
CREATE INDEX IF NOT EXISTS "viewing_requests_property_id_idx" ON "viewing_requests"("property_id");
CREATE INDEX IF NOT EXISTS "viewing_requests_status_idx" ON "viewing_requests"("status");

CREATE TABLE IF NOT EXISTS "reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agent_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "reviews_agent_id_idx" ON "reviews"("agent_id");
CREATE UNIQUE INDEX IF NOT EXISTS "reviews_agent_id_user_id_key" ON "reviews"("agent_id", "user_id");

CREATE TABLE IF NOT EXISTS "locations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'city'
);
CREATE INDEX IF NOT EXISTS "locations_name_idx" ON "locations"("name");
CREATE INDEX IF NOT EXISTS "locations_postcode_idx" ON "locations"("postcode");

CREATE TABLE IF NOT EXISTS "inquiries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "property_id" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "inquiries_status_idx" ON "inquiries"("status");
CREATE INDEX IF NOT EXISTS "inquiries_created_at_idx" ON "inquiries"("created_at");

CREATE TABLE IF NOT EXISTS "site_settings" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);
`;

async function main() {
  console.log("🚀 Pushing schema to Turso…\n");

  const statements = SQL.split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    const sql = stmt + ";";
    try {
      await db.$executeRawUnsafe(sql);
      console.log(`  ✓ ${sql.slice(0, 60)}…`);
    } catch (err) {
      console.error(`  ✗ ${sql.slice(0, 60)}…`);
      console.error(`    ${err}`);
    }
  }

  console.log("\n✅ Schema push complete!");
}

main()
  .catch((err) => {
    console.error("❌ Push failed:", err);
    process.exit(1);
  });
