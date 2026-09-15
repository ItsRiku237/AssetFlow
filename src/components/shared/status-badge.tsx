import { Badge } from "@/components/ui/badge";

import type {
  AssetStatus,
  MaintenanceRecordStatus,
  ReturnRequestStatus,
} from "@/types/asset";

const ASSET_STATUS_LABEL: Record<AssetStatus, string> = {
  AVAILABLE: "Available",
  ASSIGNED: "Assigned",
  RETURN_REQUESTED: "Return requested",
  IN_REPAIR: "In repair",
  RETIRED: "Retired",
};

const ASSET_STATUS_VARIANT: Record<
  AssetStatus,
  "default" | "secondary" | "success" | "warning" | "destructive"
> = {
  AVAILABLE: "success",
  ASSIGNED: "default",
  RETURN_REQUESTED: "warning",
  IN_REPAIR: "warning",
  RETIRED: "secondary",
};

const RETURN_STATUS_LABEL: Record<ReturnRequestStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const RETURN_STATUS_VARIANT: Record<
  ReturnRequestStatus,
  "default" | "secondary" | "success" | "warning" | "destructive"
> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
};

export function AssetStatusBadge({ status }: { status: AssetStatus }) {
  return (
    <Badge variant={ASSET_STATUS_VARIANT[status]}>
      {ASSET_STATUS_LABEL[status]}
    </Badge>
  );
}

export function ReturnRequestStatusBadge({
  status,
}: {
  status: ReturnRequestStatus;
}) {
  return (
    <Badge variant={RETURN_STATUS_VARIANT[status]}>
      {RETURN_STATUS_LABEL[status]}
    </Badge>
  );
}

const MAINTENANCE_STATUS_LABEL: Record<MaintenanceRecordStatus, string> = {
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

const MAINTENANCE_STATUS_VARIANT: Record<
  MaintenanceRecordStatus,
  "default" | "secondary" | "success" | "warning" | "destructive"
> = {
  IN_PROGRESS: "warning",
  COMPLETED: "success",
};

export function MaintenanceStatusBadge({
  status,
}: {
  status: MaintenanceRecordStatus;
}) {
  return (
    <Badge variant={MAINTENANCE_STATUS_VARIANT[status]}>
      {MAINTENANCE_STATUS_LABEL[status]}
    </Badge>
  );
}