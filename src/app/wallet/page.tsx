import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import WalletDashboard from "@/components/WalletDashboard";

export default async function WalletPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/wallet");

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 animate-fade-in-up">
      <p className="skew-x-[-6deg] bg-gradient-to-r from-orange-300 via-amber-400 to-yellow-400 bg-clip-text text-xs font-black uppercase tracking-[0.35em] text-transparent">
        Vantix
      </p>
      <h1 className="section-title mt-2 text-3xl font-black uppercase tracking-wide">My Wallet</h1>
      <p className="mt-2 text-neutral-400">
        Add funds to pay entry/hosting fees instantly, or request a withdrawal of your balance.
      </p>
      <WalletDashboard />
    </div>
  );
}
