-- Safe migration: add SUPER_ADMIN value to the Role enum.
-- ALTER TYPE … ADD VALUE is safe and additive — it does not touch
-- any existing ADMIN or EMPLOYEE rows. The IF NOT EXISTS guard makes
-- this idempotent in case it was previously applied manually.

ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
