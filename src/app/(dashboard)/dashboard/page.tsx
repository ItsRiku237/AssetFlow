import { auth } from "@/auth";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { EmployeeDashboard } from "@/components/dashboard/employee-dashboard";
import { PageHeader } from "@/components/shared/page-header";

export default async function DashboardPage() {
  const session = await auth();
  // The (dashboard) layout already guarantees a session exists before
  // this page renders; this is just narrowing the type.
  const user = session!.user;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={
          user.role === "ADMIN"
            ? "Overview of assets, assignments, and activity."
            : "Your assets, requests, and recent activity."
        }
      />
      {user.role === "ADMIN" ? (
        <AdminDashboard />
      ) : (
        <EmployeeDashboard userId={user.id} />
      )}
    </div>
  );
}
