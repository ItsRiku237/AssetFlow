import { ShieldCheck, Users } from "lucide-react";

import { AdminTable } from "@/components/admins/admin-table";
import { InviteAdminDialog } from "@/components/admins/invite-admin-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { requireSuperAdmin } from "@/lib/auth-guards";
import { getAdmins } from "@/lib/data/admins";

export default async function AdminsPage() {
  const session = await requireSuperAdmin();
  const admins = await getAdmins();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administrators"
        description="Manage admin accounts. Only super-admins can invite, activate, or deactivate administrators."
        actions={<InviteAdminDialog />}
      />

      {/* ─── Scope notice ─── */}
      <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>
          Super-admin accounts are listed here for visibility but cannot be modified
          through this interface. Admin accounts can be invited and their access
          can be enabled or disabled at any time.
        </p>
      </div>

      {admins.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No administrators yet"
          description="Invite your first administrator using the button above."
        />
      ) : (
        <AdminTable admins={admins} currentUserId={session.user.id} />
      )}
    </div>
  );
}
