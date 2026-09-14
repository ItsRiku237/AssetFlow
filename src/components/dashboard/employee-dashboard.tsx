import { Boxes, History, Undo2 } from "lucide-react";

import { ActivityRow } from "@/components/dashboard/activity-row";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  AssetStatusBadge,
  ReturnRequestStatusBadge,
} from "@/components/shared/status-badge";
import { getEmployeeDashboardData } from "@/lib/data/dashboard";
import { formatDate } from "@/lib/utils";

export async function EmployeeDashboard({ userId }: { userId: string }) {
  const data = await getEmployeeDashboardData(userId);

  return (
    <div className="space-y-6">
      <div className="grid max-w-md grid-cols-2 gap-3">
        <StatCard
          label="Assets in My Custody"
          value={data.assignedAssets.length}
          icon={Boxes}
        />
        <StatCard
          label="Pending Return Requests"
          value={data.pendingReturnRequests.length}
          icon={Undo2}
          tone="warning"
        />
      </div>

      <DashboardSection
        title="My Assigned Assets"
        description="Assets currently in your custody."
      >
        {data.assignedAssets.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title="No assets assigned"
            description="Assets assigned to you by an admin will appear here."
          />
        ) : (
          data.assignedAssets.map((a) => (
            <ActivityRow
              key={a.id}
              primary={`${a.assetName} (${a.assetTag})`}
              meta={formatDate(a.assignedAt)}
              badge={<AssetStatusBadge status={a.status} />}
            />
          ))
        )}
      </DashboardSection>

      <DashboardSection
        title="Pending Return Requests"
        description="Requests waiting on admin review."
      >
        {data.pendingReturnRequests.length === 0 ? (
          <EmptyState
            icon={Undo2}
            title="No pending requests"
            description="Return requests you submit will show up here until reviewed."
          />
        ) : (
          data.pendingReturnRequests.map((r) => (
            <ActivityRow
              key={r.id}
              primary={r.assetName}
              meta={formatDate(r.requestedAt)}
              badge={<ReturnRequestStatusBadge status={r.status} />}
            />
          ))
        )}
      </DashboardSection>

      <DashboardSection
        title="Recent Activity"
        description="Your recent asset custody history."
      >
        {data.recentActivity.length === 0 ? (
          <EmptyState
            icon={History}
            title="No activity yet"
            description="Your assignment history will appear here."
          />
        ) : (
          data.recentActivity.map((a) => (
            <ActivityRow
              key={a.id}
              primary={a.assetName}
              secondary={a.returnedAt ? "Returned" : "Assigned"}
              meta={formatDate(a.returnedAt ?? a.assignedAt)}
            />
          ))
        )}
      </DashboardSection>
    </div>
  );
}
