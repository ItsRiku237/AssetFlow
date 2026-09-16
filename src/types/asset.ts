export type AssetStatus =
  | "AVAILABLE"
  | "ASSIGNED"
  | "RETURN_REQUESTED"
  | "IN_REPAIR"
  | "RETIRED";

export type AssignmentStatus = "ACTIVE" | "RETURNED";

export type ReturnRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export type MaintenanceRecordStatus = "IN_PROGRESS" | "COMPLETED";
