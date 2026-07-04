import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import AdminPanel from "@/components/admin/AdminPanel";

export default async function AdminDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/admin");
  if (user.role !== ROLES.ADMIN) redirect("/");

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="mt-1 text-neutral-500">
        Verify payment screenshots, manage tournaments, and manage users.
      </p>

      <div className="mt-8">
        <AdminPanel currentAdminId={user.id} />
      </div>
    </div>
  );
}
