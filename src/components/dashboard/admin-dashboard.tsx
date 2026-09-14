import { Boxes, CheckCircle2, ScrollText, Undo2, Wrench } from "lucide-react";

import { ActivityRow } from "@/components/dashboard/activity-row";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ReturnRequestStatusBadge } from "@/components/shared/status-badge";
import {
  getAdminDashboardStats,
  getRecentAssignments,
  getRecentAuditActivity,
  getRecentMaintenanceActivity,
  getRecentReturnRequests,
} from "@/lib/data/dashboard";
import { formatDate } from "@/lib/utils";

export async function AdminDashboard() {
  const [stats, assignments, returnRequests, maintenance, audit] =
    await Promise.all([
      getAdminDashboardStats(),
      getRecentAssignments(),
      getRecentReturnRequests(),
      getRecentMaintenanceActivity(),
      getRecentAuditActivity(),
    ]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total Assets" value={stats.totalAssets} icon={Boxes} />
        <StatCard
          label="Available"
          value={stats.available}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard label="Assigned" value={stats.assigned} icon={Boxes} />
        <StatCard
          label="In Repair"
          value={stats.inRepair}
          icon={Wrench}
          tone="warning"
        />
        <StatCard
          label="Return Requests"
          value={stats.pendingReturnRequests}
          icon={Undo2}
          tone="warning"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardSection
          title="Recent Asset Activity"
          description="Latest assignments and returns."
        >
          {assignments.length === 0 ? (
            <EmptyState
              icon={Boxes}
              title="No asset activity yet"
              description="Assignment history will show up here once assets are assigned."
            />
          ) : (
            assignments.map((a) => (
              <ActivityRow
                key={a.id}
                primary={`${a.assetName} (${a.assetTag})`}
                secondary={`${a.employeeName} · ${a.returnedAt ? "returned" : "assigned"}`}
                meta={formatDate(a.returnedAt ?? a.assignedAt)}
              />
            ))
          )}
        </DashboardSection>

        <DashboardSection
          title="Recent Return Requests"
          description="Pending and reviewed return requests."
        >
          {returnRequests.length === 0 ? (
            <EmptyState
              icon={Undo2}
              title="No return requests yet"
              description="Employee return requests will appear here."
            />
          ) : (
            returnRequests.map((r) => (
              <ActivityRow
                key={r.id}
                primary={r.assetName}
                secondary={r.employeeName}
                meta={formatDate(r.requestedAt)}
                badge={<ReturnRequestStatusBadge status={r.status} />}
              />
            ))
          )}
        </DashboardSection>

        <DashboardSection
          title="Maintenance / Repair Activity"
          description="Latest service records."
        >
          {maintenance.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="No repairs logged"
              description="Maintenance history will show up here."
            />
          ) : (
            maintenance.map((m) => (
              <ActivityRow
                key={m.id}
                primary={m.assetName}
                secondary={m.issue}
                meta={formatDate(m.completedAt ?? m.startedAt)}
                badge={
                  <Badge variant={m.completedAt ? "success" : "warning"}>
                    {m.completedAt ? "Completed" : "In progress"}
                  </Badge>
                }
              />
            ))
          )}
        </DashboardSection>

        <DashboardSection
          title="Recent Audit Activity"
          description="System-wide action log."
        >
          {audit.length === 0 ? (
            <EmptyState
              icon={ScrollText}
              title="No audit activity yet"
              description="Actions like asset creation and status changes will be logged here."
            />
          ) : (
            audit.map((log) => (
              <ActivityRow
                key={log.id}
                primary={log.action}
                secondary={`${log.entityType} · ${log.actorName ?? "System"}`}
                meta={formatDate(log.createdAt)}
              />
            ))
          )}
        </DashboardSection>
      </div>
    </div>
  );
}
