import { Boxes, CheckCircle2, ScrollText, ShieldCheck, Undo2, UserCheck, Wrench } from "lucide-react";

import { ActivityRow } from "@/components/dashboard/activity-row";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { StatCard } from "@/components/dashboard/stat-card";
import { FadeIn } from "@/components/design-system/fade-in";
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

interface AdminDashboardProps {
  adminName?: string | null;
}

export async function AdminDashboard({ adminName }: AdminDashboardProps) {
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
      <DashboardHero
        name={adminName}
        subtitle="Here's what's happening with your assets today."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Total Assets", value: stats.totalAssets, icon: Boxes, tone: "default" as const },
          { label: "Available", value: stats.available, icon: CheckCircle2, tone: "success" as const },
          { label: "Assigned", value: stats.assigned, icon: UserCheck, tone: "default" as const },
          { label: "In Repair", value: stats.inRepair, icon: Wrench, tone: "warning" as const },
          { label: "Return Requests", value: stats.pendingReturnRequests, icon: Undo2, tone: "purple" as const },
        ].map((s, i) => (
          <FadeIn key={s.label} delay={i * 60}>
            <StatCard label={s.label} value={s.value} icon={s.icon} tone={s.tone} />
          </FadeIn>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <FadeIn delay={0} className="lg:h-[340px]">
          <DashboardSection
            title="Recent Asset Activity"
            description="Latest assignments and returns."
            viewAllHref="/assets"
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
                  icon={Boxes}
                  primary={`${a.assetName} (${a.assetTag})`}
                  secondary={`${a.employeeName} · ${a.returnedAt ? "returned" : "assigned"}`}
                  meta={formatDate(a.returnedAt ?? a.assignedAt)}
                />
              ))
            )}
          </DashboardSection>
        </FadeIn>

        <FadeIn delay={60} className="lg:h-[340px]">
          <DashboardSection
            title="Recent Return Requests"
            description="Pending and reviewed return requests."
            viewAllHref="/return-requests"
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
                  icon={Undo2}
                  primary={r.assetName}
                  secondary={r.employeeName}
                  meta={formatDate(r.requestedAt)}
                  badge={<ReturnRequestStatusBadge status={r.status} />}
                />
              ))
            )}
          </DashboardSection>
        </FadeIn>

        <FadeIn delay={120} className="lg:h-[340px]">
          <DashboardSection
            title="Maintenance / Repair Activity"
            description="Latest service records."
            viewAllHref="/repairs"
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
                  icon={Wrench}
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
        </FadeIn>

        <FadeIn delay={180} className="lg:h-[340px]">
          <DashboardSection
            title="Recent Audit Activity"
            description="System-wide action log."
            viewAllHref="/audit-logs"
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
                  icon={ShieldCheck}
                  primary={log.action}
                  secondary={`${log.entityType} · ${log.actorName ?? "System"}`}
                  meta={formatDate(log.createdAt)}
                />
              ))
            )}
          </DashboardSection>
        </FadeIn>
      </div>
    </div>
  );
}
