-- Migration: add_employee_otp_table
-- Creates the employee_otps table used for OTP-based employee account
-- activation. Uses IF NOT EXISTS so it is safe to re-run.
--
-- This table was supposed to be created by an earlier migration that
-- was accidentally corrupted. This migration creates it cleanly.
-- No existing data is modified or deleted.

CREATE TABLE IF NOT EXISTS "employee_otps" (
    "id"           TEXT NOT NULL,
    "employeeCode" TEXT NOT NULL,
    "codeHash"     TEXT NOT NULL,
    "expiresAt"    TIMESTAMP(3) NOT NULL,
    "attempts"     INTEGER NOT NULL DEFAULT 0,
    "usedAt"       TIMESTAMP(3),
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "employee_otps_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "employee_otps_employeeCode_createdAt_idx"
    ON "employee_otps"("employeeCode", "createdAt");
