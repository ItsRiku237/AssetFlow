-- Migration: add repair reimbursement workflow.
--
-- Creates the ReimbursementStatus enum and the reimbursements table.
-- All existing data is unaffected — this is a purely additive migration.

-- 1. New enum.
CREATE TYPE "ReimbursementStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- 2. Reimbursements table.
CREATE TABLE "reimbursements" (
  "id"                  TEXT NOT NULL,
  "assetId"             TEXT NOT NULL,
  "maintenanceRecordId" TEXT,
  "employeeId"          TEXT NOT NULL,
  "amount"              DECIMAL(10,2) NOT NULL,
  "description"         TEXT NOT NULL,
  "receiptReference"    TEXT,
  "status"              "ReimbursementStatus" NOT NULL DEFAULT 'PENDING',
  "submittedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt"          TIMESTAMP(3),
  "reviewedById"        TEXT,
  "rejectionReason"     TEXT,
  "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "reimbursements_pkey" PRIMARY KEY ("id")
);

-- 3. Foreign key constraints.
ALTER TABLE "reimbursements"
  ADD CONSTRAINT "reimbursements_assetId_fkey"
    FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reimbursements"
  ADD CONSTRAINT "reimbursements_maintenanceRecordId_fkey"
    FOREIGN KEY ("maintenanceRecordId") REFERENCES "maintenance_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "reimbursements"
  ADD CONSTRAINT "reimbursements_employeeId_fkey"
    FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reimbursements"
  ADD CONSTRAINT "reimbursements_reviewedById_fkey"
    FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 4. Indexes.
CREATE INDEX "reimbursements_employeeId_idx" ON "reimbursements"("employeeId");
CREATE INDEX "reimbursements_assetId_idx" ON "reimbursements"("assetId");
CREATE INDEX "reimbursements_status_idx" ON "reimbursements"("status");
