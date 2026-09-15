import { Undo2 } from "lucide-react";

import { ReturnRequestsTable } from "@/components/return-requests/return-requests-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { ReturnRequestStatusBadge } from "@/components/shared/status-badge";
import { ActivityRow } from "@/components/dashboard/activity-row";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { requireAuth } from "@/lib/auth-guards";
import {
  getReturnRequests,
  getMyReturnRequests,
} from "@/lib/data/return-requests";
import { formatDate } from "@/lib/utils";

export default async function ReturnRequestsPage() {
  const session = await requireAuth();

  if (session.user.role === "ADMIN") {
    const requests = await getReturnRequests();

    return (
      <div className="space-y-6">
        <PageHeader
          title="Return Requests"
          description="Employee return requests awaiting review."
        />

        {requests.length === 0 ? (
          <EmptyState
            icon={Undo2}
            title="No return requests"
            description="Employee return requests will appear here."
          />
        ) : (
          <ReturnRequestsTable requests={requests} />
        )}
      </div>
    );
  }

  // Employee view — only their own requests.
  const myRequests = await getMyReturnRequests(session.user.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Return Requests"
        description="Return requests you have submitted."
      />

      <DashboardSection title="Request History">
        {myRequests.length === 0 ? (
          <EmptyState
            icon={Undo2}
            title="No return requests"
            description="Return requests you submit from your assets will appear here."
          />
        ) : (
          myRequests.map((req) => (
            <ActivityRow
              key={req.id}
              primary={req.assetName}
              secondary={`${req.assetTag} · ${req.reason}`}
              meta={formatDate(req.requestedAt)}
              badge={<ReturnRequestStatusBadge status={req.status} />}
            />
          ))
        )}
      </DashboardSection>
    </div>
  );
}
