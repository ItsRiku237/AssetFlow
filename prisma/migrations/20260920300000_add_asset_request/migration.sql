-- Safe, additive migration: adds the AssetRequest table and enum.
-- No existing tables or data are modified.

CREATE TYPE "AssetRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

CREATE TABLE "asset_requests" (
    "id"           TEXT         NOT NULL,
    "assetId"      TEXT         NOT NULL,
    "employeeId"   TEXT         NOT NULL,
    "reason"       TEXT,
    "status"       "AssetRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewNote"   TEXT,
    "requestedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt"   TIMESTAMP(3),
    "reviewedById" TEXT,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "asset_requests_assetId_idx"      ON "asset_requests"("assetId");
CREATE INDEX "asset_requests_employeeId_idx"   ON "asset_requests"("employeeId");
CREATE INDEX "asset_requests_status_idx"       ON "asset_requests"("status");

ALTER TABLE "asset_requests"
    ADD CONSTRAINT "asset_requests_assetId_fkey"
        FOREIGN KEY ("assetId")      REFERENCES "assets"("id")    ON DELETE CASCADE,
    ADD CONSTRAINT "asset_requests_employeeId_fkey"
        FOREIGN KEY ("employeeId")   REFERENCES "employees"("id") ON DELETE CASCADE,
    ADD CONSTRAINT "asset_requests_reviewedById_fkey"
        FOREIGN KEY ("reviewedById") REFERENCES "users"("id")     ON DELETE SET NULL;
