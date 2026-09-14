import type { AssetStatus } from "@/types/asset";

/**
 * The only valid asset status transitions. Any code that changes an
 * asset's status — this task's Retire action, and future
 * assignment/return/repair modules — must go through
 * `assertValidAssetTransition` rather than writing `status` directly.
 */
export const ASSET_STATUS_TRANSITIONS: Record<AssetStatus, AssetStatus[]> = {
  AVAILABLE: ["ASSIGNED", "RETIRED"],
  ASSIGNED: ["RETURN_REQUESTED"],
  RETURN_REQUESTED: ["AVAILABLE", "IN_REPAIR"],
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
