import { PackageSearch } from "lucide-react";

import { AssetRequestsTable } from "@/components/asset-requests/asset-requests-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { requireRole } from "@/lib/auth-guards";
import { getAssetRequests } from "@/lib/data/asset-requests";

export default async function AssetRequestsPage() {
  await requireRole("ADMIN");
  const requests = await getAssetRequests();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asset Requests"
        description="Employee requests to be assigned assets. Approve to create an assignment."
      />

      {requests.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No asset requests"
          description="Employee asset requests will appear here for review."
        />
      ) : (
        <AssetRequestsTable requests={requests} />
      )}
    </div>
  );
}
