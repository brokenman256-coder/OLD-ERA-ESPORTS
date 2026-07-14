"use client";

import { useEffect, useState } from "react";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  note: string | null;
  createdAt: string;
}

interface TopUp {
  id: string;
  amount: number;
  proof: string;
  status: string;
  reviewNote: string | null;
  createdAt: string;
}

interface Withdrawal {
  id: string;
  amount: number;
  payoutInfo: string;
  status: string;
  reviewNote: string | null;
  createdAt: string;
}

interface Settings {
  playerUpiId: string | null;
  playerQrCodeUrl: string | null;
}

const inputClass =
  "mt-1 w-full rounded-md premium-input px-3 py-2";

function StatusPill({ status }: { status: string }) {
  const color =
    status === "APPROVED" || status === "PAID"
      ? "bg-emerald-900 text-emerald-300"
      : status === "REJECTED"
        ? "bg-red-900 text-red-300"
        : "bg-amber-900 text-amber-300";
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>{status}</span>;
}

export default function WalletDashboard() {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [topUps, setTopUps] = useState<TopUp[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpFile, setTopUpFile] = useState<File | null>(null);
  const [topUpError, setTopUpError] = useState<string | null>(null);
  const [topUpLoading, setTopUpLoading] = useState(false);

  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [payoutInfo, setPayoutInfo] = useState("");
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/wallet");
    const data = await res.json();
    setBalance(data.balance ?? 0);
    setTransactions(data.transactions ?? []);
    setTopUps(data.topUps ?? []);
    setWithdrawals(data.withdrawals ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- simple client-side data fetch on mount
    load();
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data.settings))
      .catch(() => setSettings(null));
  }, []);

  async function submitTopUp(e: React.FormEvent) {
    e.preventDefault();
    setTopUpError(null);
    if (!topUpFile) {
      setTopUpError("Please upload a payment screenshot.");
      return;
    }
    setTopUpLoading(true);
    const form = new FormData();
    form.set("amount", topUpAmount);
    form.set("proof", topUpFile);
    const res = await fetch("/api/wallet/topup", { method: "POST", body: form });
    const data = await res.json();
    setTopUpLoading(false);
    if (!res.ok) {
      setTopUpError(data.error ?? "Something went wrong");
      return;
    }
    setTopUpAmount("");
    setTopUpFile(null);
    setShowTopUp(false);
    load();
  }

  async function submitWithdraw(e: React.FormEvent) {
    e.preventDefault();
    setWithdrawError(null);
    setWithdrawLoading(true);
    const res = await fetch("/api/wallet/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(withdrawAmount), payoutInfo }),
    });
    const data = await res.json();
    setWithdrawLoading(false);
    if (!res.ok) {
      setWithdrawError(data.error ?? "Something went wrong");
      return;
    }
    setWithdrawAmount("");
    setPayoutInfo("");
    setShowWithdraw(false);
    load();
  }

  if (loading) return <p className="mt-8 text-neutral-500">Loading...</p>;

  return (
    <div className="mt-8 space-y-8">
      <div className="glass-panel clip-corner relative overflow-hidden p-6">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Available balance</p>
        <p className="mt-1 bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-4xl font-black text-transparent">
          ₹{balance}
        </p>
        <div className="relative mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => { setShowTopUp((v) => !v); setShowWithdraw(false); }}
            className="clip-corner-sm premium-btn px-4 py-2 text-sm font-bold uppercase tracking-wide"
          >
            Add funds
          </button>
          <button
            onClick={() => { setShowWithdraw((v) => !v); setShowTopUp(false); }}
            className="clip-corner-sm border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold uppercase tracking-wide text-neutral-300 transition hover:bg-white/10 hover:text-white"
          >
            Request withdrawal
          </button>
        </div>
      </div>

      {showTopUp && (
        <form onSubmit={submitTopUp} className="space-y-3 glass-panel clip-corner p-5">
          <h3 className="font-bold">Add funds</h3>
          {settings?.playerUpiId && (
            <p className="text-sm text-neutral-400">
              Pay via UPI: <span className="font-mono font-semibold text-cyan-400">{settings.playerUpiId}</span>, then
              upload the screenshot below. An admin will verify and credit your wallet.
            </p>
          )}
          {settings?.playerQrCodeUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded QR image
            <img src={settings.playerQrCodeUrl} alt="Payment QR code" className="h-24 w-24 rounded-md border border-neutral-700 bg-white object-contain" />
          )}
          <input
            type="number"
            min="1"
            value={topUpAmount}
            onChange={(e) => setTopUpAmount(e.target.value)}
            placeholder="Amount (₹)"
            required
            className={inputClass}
          />
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setTopUpFile(e.target.files?.[0] ?? null)}
            className="mt-1 w-full text-sm"
          />
          {topUpError && <p className="text-sm text-red-400">{topUpError}</p>}
          <button
            disabled={topUpLoading}
            className="clip-corner-sm premium-btn px-4 py-2 text-sm font-bold uppercase tracking-wide"
          >
            {topUpLoading ? "Submitting…" : "Submit for approval"}
          </button>
        </form>
      )}

      {showWithdraw && (
        <form onSubmit={submitWithdraw} className="space-y-3 glass-panel clip-corner p-5">
          <h3 className="font-bold">Request withdrawal</h3>
          <p className="text-sm text-neutral-400">
            Your balance is deducted immediately. Payouts are processed manually within 2–3 business days.
          </p>
          <input
            type="number"
            min="1"
            max={balance ?? undefined}
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="Amount (₹)"
            required
            className={inputClass}
          />
          <input
            value={payoutInfo}
            onChange={(e) => setPayoutInfo(e.target.value)}
            placeholder="Your UPI ID to receive the payout"
            required
            className={inputClass}
          />
          {withdrawError && <p className="text-sm text-red-400">{withdrawError}</p>}
          <button
            disabled={withdrawLoading}
            className="clip-corner-sm premium-btn px-4 py-2 text-sm font-bold uppercase tracking-wide"
          >
            {withdrawLoading ? "Submitting…" : "Request withdrawal"}
          </button>
        </form>
      )}

      {(topUps.length > 0 || withdrawals.length > 0) && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {topUps.length > 0 && (
            <div>
              <h3 className="font-bold">Top-up requests</h3>
              <div className="mt-3 space-y-2">
                {topUps.map((t) => (
                  <div key={t.id} className="glass-panel clip-corner p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">₹{t.amount}</span>
                      <StatusPill status={t.status} />
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">{new Date(t.createdAt).toLocaleString()}</p>
                    {t.reviewNote && <p className="mt-1 text-xs text-neutral-400">Note: {t.reviewNote}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {withdrawals.length > 0 && (
            <div>
              <h3 className="font-bold">Withdrawal requests</h3>
              <div className="mt-3 space-y-2">
                {withdrawals.map((w) => (
                  <div key={w.id} className="glass-panel clip-corner p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">₹{w.amount}</span>
                      <StatusPill status={w.status} />
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">{new Date(w.createdAt).toLocaleString()}</p>
                    <p className="mt-1 text-xs text-neutral-500">To: {w.payoutInfo}</p>
                    {w.reviewNote && <p className="mt-1 text-xs text-neutral-400">Note: {w.reviewNote}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div>
        <h3 className="font-bold">Recent activity</h3>
        {transactions.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">No wallet activity yet.</p>
        ) : (
          <div className="mt-3 space-y-1">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-md border border-neutral-900 bg-neutral-950/60 px-3 py-2 text-sm">
                <div>
                  <p>{t.note ?? t.type}</p>
                  <p className="text-xs text-neutral-500">{new Date(t.createdAt).toLocaleString()}</p>
                </div>
                <span className={t.amount >= 0 ? "font-semibold text-emerald-400" : "font-semibold text-red-400"}>
                  {t.amount >= 0 ? "+" : ""}
                  {t.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
