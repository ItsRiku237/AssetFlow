-- Safe migration: add storageType to assets.
-- Existing assets keep their old values; the new column is nullable
-- so no existing data is changed or deleted.
ALTER TABLE "assets" ADD COLUMN IF NOT EXISTS "storageType" TEXT;
