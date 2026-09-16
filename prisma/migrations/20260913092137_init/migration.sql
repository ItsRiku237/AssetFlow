-- Migration: add onboardingRequired to users
-- Existing rows (admin + seeded employees) default to FALSE so they
-- are not affected — they keep working without any change.
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "onboardingRequired" BOOLEAN NOT NULL DEFAULT false;
