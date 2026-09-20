-- Migration: add UserStatus enum, status column on users, and fix
-- nullable FK onDelete behaviour for AuditLog.actorId and
-- ReturnRequest.reviewedById so that deleting a User row nullifies
-- those references rather than being blocked by Postgres.

-- 1. Add the UserStatus enum.
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DEACTIVATED');

-- 2. Add status column to users with ACTIVE as default.
--    All existing rows get ACTIVE automatically.
ALTER TABLE "users" ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- 3. Fix AuditLog.actorId: drop the old FK (no ON DELETE clause →
--    Postgres defaults to NO ACTION which blocks deletion) and
--    re-add it with ON DELETE SET NULL.
ALTER TABLE "audit_logs" DROP CONSTRAINT IF EXISTS "audit_logs_actorId_fkey";
ALTER TABLE "audit_logs"
  ADD CONSTRAINT "audit_logs_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 4. Fix ReturnRequest.reviewedById the same way.
ALTER TABLE "return_requests" DROP CONSTRAINT IF EXISTS "return_requests_reviewedById_fkey";
ALTER TABLE "return_requests"
  ADD CONSTRAINT "return_requests_reviewedById_fkey"
  FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
