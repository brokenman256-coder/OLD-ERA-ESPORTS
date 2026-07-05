import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import WalletDashboard from "@/components/WalletDashboard";

export default async function WalletPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/wallet");

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold">My Wallet</h1>
      <p className="mt-2 text-neutral-400">
        Add funds to pay entry/hosting fees instantly, or request a withdrawal of your balance.
      </p>
      <WalletDashboard />
    </div>
  );
}
