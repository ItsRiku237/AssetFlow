import { auth } from "@/auth";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { EmployeeDashboard } from "@/components/dashboard/employee-dashboard";

export default async function DashboardPage() {
  const session = await auth();
  const user = session!.user;
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  if (isAdmin) {
    return <AdminDashboard adminName={user.name} />;
  }

  return <EmployeeDashboard userId={user.id} userName={user.name} />;
}
