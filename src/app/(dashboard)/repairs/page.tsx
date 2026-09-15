import { History, Wrench } from "lucide-react";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { AssetsInRepairTable } from "@/components/maintenance/assets-in-repair-table";
import { MaintenanceHistoryTable } from "@/components/maintenance/maintenance-history-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { requireRole } from "@/lib/auth-guards";
import {
  getAssetsInRepair,
  getMaintenanceHistory,
} from "@/lib/data/maintenance";

export default async function RepairsPage() {
  await requireRole("ADMIN");

  const [assetsInRepair, history] = await Promise.all([
    getAssetsInRepair(),
    getMaintenanceHistory(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance & Repairs"
        description="Assets currently under repair and their full service history."
      />

      <DashboardSection
        title="Assets In Repair"
        description="Log what's wrong, then mark repairs complete when they're done."
      >
        {assetsInRepair.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No assets in repair"
            description="Assets sent for repair from an approved return request will appear here."
          />
        ) : (
          <AssetsInRepairTable assets={assetsInRepair} />
        )}
      </DashboardSection>

      <DashboardSection
        title="Maintenance History"
        description="Every service record, past and present."
      >
        {history.length === 0 ? (
          <EmptyState
            icon={History}
            title="No maintenance records yet"
            description="Records will appear here once a repair is logged."
          />
        ) : (
          <MaintenanceHistoryTable records={history} />
        )}
      </DashboardSection>
    </div>
  );
}
