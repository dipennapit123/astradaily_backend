-- AstraDaily schema: run this once on your PostgreSQL database (e.g. Railway, local).
-- Uses plain PostgreSQL (no Prisma). IDs are TEXT; generate in app with crypto.randomUUID().

-- Enums (names match Prisma-style for compatibility)
DO $$ BEGIN
  CREATE TYPE "ZodiacSign" AS ENUM (
    'ARIES', 'TAURUS', 'GEMINI', 'CANCER', 'LEO', 'VIRGO',
    'LIBRA', 'SCORPIO', 'SAGITTARIUS', 'CAPRICORN', 'AQUARIUS', 'PISCES'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'EDITOR');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE "UserActivityAction" AS ENUM ('APP_OPEN', 'HOROSCOPE_VIEW', 'ZODIAC_SELECTED', 'SETTINGS_VIEW');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- User (Clerk-synced)
CREATE TABLE IF NOT EXISTS "User" (
  id            TEXT PRIMARY KEY,
  "clerkUserId" TEXT NOT NULL UNIQUE,
  email         TEXT NOT NULL UNIQUE,
  "fullName"    TEXT,
  "avatarUrl"   TEXT,
  "zodiacSign"  "ZodiacSign",
  timezone      TEXT,
  "lastActiveAt" TIMESTAMPTZ,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- UserActivity
CREATE TABLE IF NOT EXISTS "UserActivity" (
  id          TEXT PRIMARY KEY,
  "userId"    TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  action      "UserActivityAction" NOT NULL,
  "sessionId" TEXT,
  platform    TEXT,
  "appVersion" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_created ON "UserActivity"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS idx_user_activity_user_action_created ON "UserActivity"("userId", action, "createdAt");
CREATE INDEX IF NOT EXISTS idx_user_activity_action_created ON "UserActivity"(action, "createdAt");

-- Admin (dashboard login)
CREATE TABLE IF NOT EXISTS "Admin" (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  email          TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  role           "AdminRole" NOT NULL DEFAULT 'EDITOR',
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Horoscope
CREATE TABLE IF NOT EXISTS "Horoscope" (
  id                   TEXT PRIMARY KEY,
  "zodiacSign"         "ZodiacSign" NOT NULL,
  date                 TIMESTAMPTZ NOT NULL,
  title                TEXT NOT NULL,
  summary              TEXT NOT NULL,
  "wealthText"         TEXT NOT NULL,
  "loveText"           TEXT NOT NULL,
  "healthText"         TEXT NOT NULL,
  "wealthConfidence"    INTEGER NOT NULL,
  "loveConfidence"     INTEGER NOT NULL,
  "healthConfidence"   INTEGER NOT NULL,
  "wealthActionLabel"  TEXT,
  "loveActionLabel"    TEXT,
  "healthActionLabel"  TEXT,
  "weeklyOutlook"      TEXT,
  "isPublished"        BOOLEAN NOT NULL DEFAULT FALSE,
  "createdById"        TEXT REFERENCES "Admin"(id),
  "updatedById"        TEXT REFERENCES "Admin"(id),
  "createdAt"          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_horoscope_zodiac_date ON "Horoscope"("zodiacSign", date);
