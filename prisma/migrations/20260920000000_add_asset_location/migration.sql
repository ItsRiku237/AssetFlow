-- Migration: add_asset_location
-- Creates the asset_locations table for physical location tracking.
-- Uses IF NOT EXISTS / DO $$ guards so it is safe to re-run.
-- Existing assets are unaffected — location is optional.

-- Create the LocationType enum if it doesn't already exist.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'LocationType') THEN
    CREATE TYPE "LocationType" AS ENUM ('OFFICE', 'REMOTE', 'OTHER');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "asset_locations" (
    "id"           TEXT NOT NULL,
    "assetId"      TEXT NOT NULL,
    "locationType" "LocationType" NOT NULL,
    "building"     TEXT,
    "floor"        TEXT,
    "room"         TEXT,
    "desk"         TEXT,
    "description"  TEXT,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "asset_locations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "asset_locations_assetId_fkey"
        FOREIGN KEY ("assetId") REFERENCES "assets"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "asset_locations_assetId_key"
    ON "asset_locations"("assetId");
