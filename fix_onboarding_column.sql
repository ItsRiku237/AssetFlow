-- Safe patch: add onboardingRequired column if it doesn't already exist.
-- Existing rows default to FALSE — no data is changed or deleted.
-- Run once with: npx prisma db execute --file fix_onboarding_column.sql
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "onboardingRequired" BOOLEAN NOT NULL DEFAULT false;
