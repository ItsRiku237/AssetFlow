import type { AssetStatus } from "@/types/asset";

export const ASSET_STATUS_TRANSITIONS: Record<AssetStatus, AssetStatus[]> = {
  AVAILABLE: ["ASSIGNED", "RETIRED"],
  ASSIGNED: ["RETURN_REQUESTED"],
  // ASSIGNED is also a valid target for RETURN_REQUESTED: this covers
  // the rejection path where an admin denies a return request and
  // custody reverts to the employee who already holds the asset.
  RETURN_REQUESTED: ["AVAILABLE", "IN_REPAIR", "ASSIGNED"],
  IN_REPAIR: ["AVAILABLE"],
  RETIRED: [],
};

export function canTransitionAssetStatus(
  from: AssetStatus,
  to: AssetStatus
): boolean {
  return ASSET_STATUS_TRANSITIONS[from].includes(to);
}

export class InvalidAssetTransitionError extends Error {
  constructor(from: AssetStatus, to: AssetStatus) {
    super(`Cannot move an asset from ${from} to ${to}.`);
    this.name = "InvalidAssetTransitionError";
  }
}

export function assertValidAssetTransition(
  from: AssetStatus,
  to: AssetStatus
): void {
  if (!canTransitionAssetStatus(from, to)) {
    throw new InvalidAssetTransitionError(from, to);
  }
}