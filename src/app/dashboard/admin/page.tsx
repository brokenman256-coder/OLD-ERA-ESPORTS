import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import AdminPanel from "@/components/admin/AdminPanel";

export default async function AdminDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/admin");
  if (user.role !== ROLES.ADMIN) redirect("/");

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 animate-fade-in-up">
      <p className="skew-x-[-6deg] bg-gradient-to-r from-orange-300 via-amber-400 to-yellow-400 bg-clip-text text-xs font-black uppercase tracking-[0.35em] text-transparent">
        Vantix
      </p>
      <h1 className="section-title mt-2 text-3xl font-black uppercase tracking-wide">Admin Dashboard</h1>
      <p className="mt-1 text-neutral-500">
        Verify payment screenshots, manage tournaments, and manage users.
      </p>

      <div className="mt-8">
        <AdminPanel currentAdminId={user.id} />
      </div>
    </div>
  );
}
