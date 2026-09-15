import Link from "next/link";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AssignAssetDialog,
  type AssignableEmployee,
} from "@/components/assets/assign-asset-dialog";
import { RetireAssetButton } from "@/components/assets/retire-asset-button";
import type { AssetStatus } from "@/types/asset";

export function AssetActions({
  assetId,
  status,
  assignableEmployees,
}: {
  assetId: string;
  status: AssetStatus;
  assignableEmployees: AssignableEmployee[];
}) {
  if (status === "RETIRED") {
    return (
      <span className="text-sm text-muted-foreground">
        This asset is retired — view only.
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" asChild>
        <Link href={`/assets/${assetId}/edit`}>
          <Pencil className="size-4" />
          Edit
        </Link>
      </Button>

      {status === "AVAILABLE" ? (
        <>
          <AssignAssetDialog assetId={assetId} employees={assignableEmployees} />
          <RetireAssetButton assetId={assetId} />
        </>
      ) : null}

      {status === "ASSIGNED" ? (
        <Button variant="outline" size="sm" asChild>
          <Link href="/assignments">View assignments</Link>
        </Button>
      ) : null}

      {status === "RETURN_REQUESTED" ? (
        <Button variant="outline" size="sm" asChild>
          <Link href="/return-requests">Process return</Link>
        </Button>
      ) : null}

      {status === "IN_REPAIR" ? (
        <Button variant="outline" size="sm" disabled title="Repair module isn't built yet">
          View repair state
        </Button>
      ) : null}
    </div>
  );
}