-- Migration: add_notifications_table
-- Creates the notifications table and adds the optional `link` column
-- used for in-app navigation when the user clicks a notification.
-- Safe to re-run: uses IF NOT EXISTS guards throughout.

CREATE TABLE IF NOT EXISTS "notifications" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "title"     TEXT NOT NULL,
    "message"   TEXT NOT NULL,
    "link"      TEXT,
    "read"      BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notifications_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "notifications_userId_read_idx"
    ON "notifications"("userId", "read");

-- If the table already existed without the `link` column, add it safely.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'link'
  ) THEN
    ALTER TABLE "notifications" ADD COLUMN "link" TEXT;
  END IF;
END
$$;
