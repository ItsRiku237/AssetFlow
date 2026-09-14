import { AssetForm } from "@/components/assets/asset-form";
import { PageHeader } from "@/components/shared/page-header";
import { createAsset } from "@/lib/actions/asset-actions";
import { requireRole } from "@/lib/auth-guards";

export default async function NewAssetPage() {
  await requireRole("ADMIN");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Asset"
        description="Register a new company asset."
      />
      <AssetForm action={createAsset} submitLabel="Create asset" />
    </div>
  );
}
