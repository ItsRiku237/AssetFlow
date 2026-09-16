-- Safe to run multiple times: all ADD COLUMN use IF NOT EXISTS,
-- CREATE TYPE is guarded, and the FK is only altered if needed.
-- This brings the live DB up to match the Task 11 schema.

-- 1. Add EmployeeStatus enum (no-op if already exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EmployeeStatus') THEN
    CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'INACTIVE');
  END IF;
END
$$;

-- 2. Add status column (default ACTIVE for all existing rows)
ALTER TABLE "employees"
  ADD COLUMN IF NOT EXISTS "status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE';

-- 3. Add name column (nullable for backfill, then NOT NULL)
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "name" TEXT;

UPDATE "employees" e
SET "name" = u."name"
FROM "users" u
WHERE e."userId" = u."id" AND e."name" IS NULL;

UPDATE "employees"
SET "name" = "employeeCode"
WHERE "name" IS NULL;

ALTER TABLE "employees" ALTER COLUMN "name" SET NOT NULL;

-- 4. Add optional directory email, backfilled from linked user
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "email" TEXT;

UPDATE "employees" e
SET "email" = u."email"
FROM "users" u
WHERE e."userId" = u."id" AND e."email" IS NULL;

-- 5. Make department and designation optional
ALTER TABLE "employees" ALTER COLUMN "department" DROP NOT NULL;
ALTER TABLE "employees" ALTER COLUMN "designation" DROP NOT NULL;

-- 6. Make userId optional (ON DELETE SET NULL so employee history survives user deletion)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'employees_userId_fkey'
    AND table_name = 'employees'
  ) THEN
    ALTER TABLE "employees" DROP CONSTRAINT "employees_userId_fkey";
  END IF;
END
$$;

ALTER TABLE "employees" ALTER COLUMN "userId" DROP NOT NULL;

ALTER TABLE "employees"
  ADD CONSTRAINT "employees_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- 7. Indexes (IF NOT EXISTS prevents errors on re-runs)
CREATE INDEX IF NOT EXISTS "employees_status_idx" ON "employees"("status");
CREATE INDEX IF NOT EXISTS "employees_department_idx" ON "employees"("department");