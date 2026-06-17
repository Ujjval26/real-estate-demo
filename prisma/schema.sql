-- ===========================================================================
-- Estateably — schema.sql
-- Target database: Turso (libSQL / SQLite-compatible)
-- ===========================================================================
-- This file is the database-agnostic source of truth for the schema.
-- It mirrors prisma/schema.prisma but can be executed directly against any
-- SQLite/libSQL database (e.g. via `turso db shell <db> < schema.sql` or
-- the libSQL CLI).
--
-- Notes:
--   * All money columns are INTEGER (whole GBP) — never store currency as
--     REAL/float.
--   * JSON-shaped columns (features, search_criteria) are TEXT and are
--     serialised/parsed by the application.
--   * Timestamps are stored as ISO-8601 strings (TEXT) which is what SQLite
--     returns from CURRENT_TIMESTAMP by default.
-- ===========================================================================

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  email          TEXT NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,
  role           TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'agent', 'admin')),
  phone          TEXT,
  email_verified INTEGER NOT NULL DEFAULT 0, -- 0 = false, 1 = true
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users (role);

-- ---------------------------------------------------------------------------
-- properties
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS properties (
  id              TEXT PRIMARY KEY,
  agent_id        TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT NOT NULL,
  price           INTEGER NOT NULL,                              -- whole GBP
  listing_type    TEXT NOT NULL DEFAULT 'sale'
                    CHECK (listing_type IN ('sale', 'rent')),
  property_type   TEXT NOT NULL DEFAULT 'house'
                    CHECK (property_type IN ('house', 'flat', 'bungalow', 'maisonette', 'cottage', 'land', 'other')),
  bedrooms        INTEGER NOT NULL DEFAULT 1,
  bathrooms       INTEGER NOT NULL DEFAULT 1,
  reception_rooms INTEGER NOT NULL DEFAULT 1,
  address         TEXT NOT NULL,
  postcode        TEXT NOT NULL,
  city            TEXT NOT NULL,
  latitude        REAL,
  longitude       REAL,
  epc_rating      TEXT,                                          -- A–G
  features        TEXT NOT NULL DEFAULT '[]',                    -- JSON array
  floor_plan_url  TEXT,
  status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'active', 'sold', 'let', 'withdrawn')),
  is_new_build    INTEGER NOT NULL DEFAULT 0,
  has_garden      INTEGER NOT NULL DEFAULT 0,
  has_parking     INTEGER NOT NULL DEFAULT 0,
  view_count      INTEGER NOT NULL DEFAULT 0,
  enquiry_count   INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON properties (listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_city         ON properties (city);
CREATE INDEX IF NOT EXISTS idx_properties_status       ON properties (status);
CREATE INDEX IF NOT EXISTS idx_properties_price        ON properties (price);
CREATE INDEX IF NOT EXISTS idx_properties_agent        ON properties (agent_id);
CREATE INDEX IF NOT EXISTS idx_properties_bedrooms     ON properties (bedrooms);

-- ---------------------------------------------------------------------------
-- property_images
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS property_images (
  id          TEXT PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES properties (id) ON DELETE CASCADE,
  image_url   TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_property_images_property ON property_images (property_id);

-- ---------------------------------------------------------------------------
-- favourites
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS favourites (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  property_id TEXT NOT NULL REFERENCES properties (id) ON DELETE CASCADE,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (user_id, property_id)
);

CREATE INDEX IF NOT EXISTS idx_favourites_user ON favourites (user_id);

-- ---------------------------------------------------------------------------
-- saved_searches
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS saved_searches (
  id                   TEXT PRIMARY KEY,
  user_id              TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name                 TEXT,
  search_criteria      TEXT NOT NULL DEFAULT '{}',          -- JSON
  email_alerts_enabled INTEGER NOT NULL DEFAULT 0,
  last_alerted_at      TEXT,
  created_at           TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches (user_id);

-- ---------------------------------------------------------------------------
-- messages
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
  id           TEXT PRIMARY KEY,
  sender_id    TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  receiver_id  TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  property_id  TEXT REFERENCES properties (id) ON DELETE SET NULL,
  subject      TEXT,
  message_text TEXT NOT NULL,
  read_status  INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_messages_sender   ON messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages (receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_property ON messages (property_id);

-- ---------------------------------------------------------------------------
-- viewing_requests
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS viewing_requests (
  id             TEXT PRIMARY KEY,
  user_id        TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  property_id    TEXT NOT NULL REFERENCES properties (id) ON DELETE CASCADE,
  requested_date TEXT NOT NULL,                                -- ISO-8601
  notes          TEXT,
  status         TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'confirmed', 'declined', 'completed', 'cancelled')),
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_viewing_requests_user     ON viewing_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_viewing_requests_property ON viewing_requests (property_id);
CREATE INDEX IF NOT EXISTS idx_viewing_requests_status   ON viewing_requests (status);

-- ---------------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id         TEXT PRIMARY KEY,
  agent_id   TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (agent_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_agent ON reviews (agent_id);
