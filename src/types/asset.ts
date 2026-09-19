export type AssetStatus =
  | "AVAILABLE"
  | "ASSIGNED"
  | "RETURN_REQUESTED"
  | "IN_REPAIR"
  | "RETIRED";

export type AssignmentStatus = "ACTIVE" | "RETURNED";

export type ReturnRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export type MaintenanceRecordStatus = "IN_PROGRESS" | "COMPLETED";

export type LocationType = "OFFICE" | "REMOTE" | "OTHER";

export interface AssetLocationData {
  id: string;
  locationType: LocationType;
  building: string | null;
  floor: string | null;
  room: string | null;
  desk: string | null;
  description: string | null;
}
